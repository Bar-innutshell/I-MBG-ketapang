// AI-generated component to test Artikel API
import React, { useEffect, useState } from 'react';
import { artikelAPI, imageUrl } from '../hooks/api';

export default function ArtikelManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', gambar: null });
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await artikelAPI.list();
      const arr = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
      setItems(Array.isArray(arr) ? arr : []);
    } catch(e){ setError(e.message);} finally { setLoading(false);} }

  useEffect(()=>{ load(); }, []);

  function onChange(e){
    const { name, value, files } = e.target;
    if (files) setForm(f => ({ ...f, [name]: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  function resetForm(){ setForm({ judul: '', isi: '', gambar: null }); setEditingId(null); }

  async function submit(e){
    e.preventDefault();
    try {
      if (editingId) await artikelAPI.update(editingId, form);
      else await artikelAPI.create(form);
      resetForm();
      load();
    } catch(e){ setError(e.message); }
  }

  async function startEdit(item){
    setEditingId(item._id);
    setForm({ judul: item.judul, isi: item.isi, gambar: null });
  }

  async function remove(id){
    if(!window.confirm('Hapus artikel?')) return;
    try { await artikelAPI.remove(id); load(); } catch(e){ setError(e.message); }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Artikel Manager <span className="text-sm font-normal text-slate-500">(AI generated)</span></h2>
      {error && <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Judul</label>
          <input name="judul" value={form.judul} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Isi</label>
          <textarea name="isi" value={form.isi} onChange={onChange} rows={4} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Gambar {editingId && '(kosongkan jika tidak ganti)'}
            <input type="file" name="gambar" accept="image/*" onChange={onChange} className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white hover:file:bg-blue-700" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={resetForm} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-medium">Daftar ({items.length}) {loading && <span className="text-sm text-slate-500">...loading</span>}</h3>
        <div className="mt-3 space-y-2">
          {items.map(a => (
            <div key={a._id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {a.gambar && <img src={imageUrl(a.gambar)} alt="thumb" className="h-[70px] w-[70px] rounded object-cover" />}
              <div className="flex-1">
                <div className="font-semibold">{a.judul}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{a.isi.slice(0,120)}{a.isi.length>120?'...':''}</div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={()=>startEdit(a)} className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={()=>remove(a._id)} className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
