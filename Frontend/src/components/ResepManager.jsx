// AI-generated component to test Resep API
import React, { useEffect, useState } from 'react';
import { resepAPI, imageUrl } from '../hooks/api';

function parseMaybeJSON(v){
  if (v === '' || v == null) return undefined;
  try { return JSON.parse(v); } catch { return v; }
}

export default function ResepManager(){
  const empty = { judul:'', deskripsi:'', porsi:'', durasiMenit:'', tingkatKesulitan:'mudah', perkiraanBiaya:'', ingredients:'[]', langkahMasak:'[]', nutrisi:'{}', tags:'[]', gambar:null };
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load(){
    setLoading(true); setError(null);
    try {
      const data = await resepAPI.list();
      const arr = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
      setItems(Array.isArray(arr) ? arr : []);
    } catch(e){ setError(e.message); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  function onChange(e){
    const { name, value, files } = e.target;
    if (files) setForm(f => ({ ...f, [name]: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  function reset(){ setForm(empty); setEditingId(null); }

  async function submit(e){
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        judul: form.judul,
        deskripsi: form.deskripsi,
        porsi: form.porsi || undefined,
        durasiMenit: form.durasiMenit || undefined,
        tingkatKesulitan: form.tingkatKesulitan,
        perkiraanBiaya: form.perkiraanBiaya || undefined,
        ingredients: parseMaybeJSON(form.ingredients),
        langkahMasak: parseMaybeJSON(form.langkahMasak),
        nutrisi: parseMaybeJSON(form.nutrisi),
        tags: parseMaybeJSON(form.tags),
        gambar: form.gambar
      };
      if (editingId) await resepAPI.update(editingId, payload); else await resepAPI.create(payload);
      reset();
      load();
    } catch(e){ setError(e.message); }
  }

  function startEdit(item){
    setEditingId(item._id);
    setForm({
      judul: item.judul || '',
      deskripsi: item.deskripsi || '',
      porsi: item.porsi ?? '',
      durasiMenit: item.durasiMenit ?? '',
      tingkatKesulitan: item.tingkatKesulitan || 'mudah',
      perkiraanBiaya: item.perkiraanBiaya ?? '',
      ingredients: JSON.stringify(item.ingredients || [], null, 2),
      langkahMasak: JSON.stringify(item.langkahMasak || [], null, 2),
      nutrisi: JSON.stringify(item.nutrisi || {}, null, 2),
      tags: JSON.stringify(item.tags || [], null, 2),
      gambar: null
    });
  }

  async function remove(id){
    if(!window.confirm('Hapus resep?')) return;
    try { await resepAPI.remove(id); load(); } catch(e){ setError(e.message); }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Resep Manager <span className="text-sm font-normal text-slate-500">(AI generated)</span></h2>
      {error && <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Judul</label>
          <input name="judul" value={form.judul} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Deskripsi</label>
          <textarea name="deskripsi" value={form.deskripsi} onChange={onChange} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Porsi</label>
            <input name="porsi" value={form.porsi} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Durasi (menit)</label>
            <input name="durasiMenit" value={form.durasiMenit} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kesulitan</label>
            <select name="tingkatKesulitan" value={form.tingkatKesulitan} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
              <option value="mudah">mudah</option>
              <option value="sedang">sedang</option>
              <option value="sulit">sulit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Biaya (Rp)</label>
            <input name="perkiraanBiaya" value={form.perkiraanBiaya} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Ingredients (JSON array)</label>
          <textarea name="ingredients" value={form.ingredients} onChange={onChange} rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Langkah Masak (JSON array)</label>
          <textarea name="langkahMasak" value={form.langkahMasak} onChange={onChange} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Nutrisi (JSON object)</label>
          <textarea name="nutrisi" value={form.nutrisi} onChange={onChange} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tags (JSON array)</label>
          <textarea name="tags" value={form.tags} onChange={onChange} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Gambar {editingId && '(kosongkan jika tidak ganti)'}
            <input type="file" name="gambar" accept="image/*" onChange={onChange} className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={reset} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-medium">Daftar Resep ({items.length}) {loading && <span className="text-sm text-slate-500">...loading</span>}</h3>
        <div className="mt-3 space-y-2">
          {items.map(r => (
            <div key={r._id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {r.gambar && <img src={imageUrl(r.gambar)} alt="thumb" className="h-[70px] w-[70px] rounded object-cover" />}
              <div className="flex-1">
                <div className="font-semibold">{r.judul} <span className="text-xs font-normal text-slate-500">({r.tingkatKesulitan})</span></div>
                <div className="mt-1 text-xs text-slate-600">Porsi: {r.porsi} | Durasi: {r.durasiMenit}m | Biaya: {r.perkiraanBiaya}</div>
                <div className="mt-1 text-xs text-slate-500">{(r.tags||[]).join(', ')}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={()=>startEdit(r)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                  <button onClick={()=>remove(r._id)} className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
