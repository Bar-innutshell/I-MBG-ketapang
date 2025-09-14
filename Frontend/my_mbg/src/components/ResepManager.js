// AI-generated component to test Resep API
import React, { useEffect, useState } from 'react';
import { resepAPI, imageUrl } from '../api';

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
    try { const data = await resepAPI.list(); setItems(data); } catch(e){ setError(e.message); } finally { setLoading(false); }
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
    <div className="panel">
      <h2>Resep Manager <span style={{fontSize:'0.7em', fontWeight:'normal'}}>(AI generated)</span></h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="box" style={{display:'grid', gap:'8px', marginBottom:'1rem'}}>
        <div>
          <label>Judul<br/><input name="judul" value={form.judul} onChange={onChange} required /></label>
        </div>
        <div>
          <label>Deskripsi<br/><textarea name="deskripsi" value={form.deskripsi} onChange={onChange} rows={2} /></label>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <label style={{flex:1}}>Porsi<br/><input name="porsi" value={form.porsi} onChange={onChange} /></label>
          <label style={{flex:1}}>Durasi (menit)<br/><input name="durasiMenit" value={form.durasiMenit} onChange={onChange} /></label>
          <label style={{flex:1}}>Kesulitan<br/>
            <select name="tingkatKesulitan" value={form.tingkatKesulitan} onChange={onChange}>
              <option value="mudah">mudah</option>
              <option value="sedang">sedang</option>
              <option value="sulit">sulit</option>
            </select>
          </label>
          <label style={{flex:1}}>Biaya (Rp)<br/><input name="perkiraanBiaya" value={form.perkiraanBiaya} onChange={onChange} /></label>
        </div>
        <div>
          <label>Ingredients (JSON array)<br/>
            <textarea name="ingredients" value={form.ingredients} onChange={onChange} rows={4} />
          </label>
        </div>
        <div>
          <label>Langkah Masak (JSON array)<br/>
            <textarea name="langkahMasak" value={form.langkahMasak} onChange={onChange} rows={3} />
          </label>
        </div>
        <div>
          <label>Nutrisi (JSON object)<br/>
            <textarea name="nutrisi" value={form.nutrisi} onChange={onChange} rows={2} />
          </label>
        </div>
        <div>
          <label>Tags (JSON array)<br/>
            <textarea name="tags" value={form.tags} onChange={onChange} rows={2} />
          </label>
        </div>
        <div>
          <label>Gambar {editingId && '(kosongkan jika tidak ganti)'}<br/>
            <input type="file" name="gambar" accept="image/*" onChange={onChange} />
          </label>
        </div>
        <div>
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" style={{marginLeft:8}} onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div>
        <h3>Daftar Resep ({items.length}) {loading && '...loading'}</h3>
        {items.map(r => (
          <div key={r._id} style={{border:'1px solid #ccc', padding:'8px', marginBottom:'6px', display:'flex', gap:'8px'}}>
            {r.gambar && <img src={imageUrl(r.gambar)} alt="thumb" style={{width:70, height:70, objectFit:'cover', borderRadius:4}} />}
            <div style={{flex:1}}>
              <strong>{r.judul}</strong> <span style={{fontSize:'.75em'}}>({r.tingkatKesulitan})</span>
              <div style={{fontSize:'.8em', marginTop:4}}>Porsi: {r.porsi} | Durasi: {r.durasiMenit}m | Biaya: {r.perkiraanBiaya}</div>
              <div style={{fontSize:'.75em', marginTop:4}}>{(r.tags||[]).join(', ')}</div>
              <div style={{marginTop:4}}>
                <button onClick={()=>startEdit(r)}>Edit</button>
                <button style={{marginLeft:6, color:'red'}} onClick={()=>remove(r._id)}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
