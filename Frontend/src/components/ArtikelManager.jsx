// AI-generated component to test Artikel API
import React, { useEffect, useState } from 'react';
import { resepAPI, imageUrl } from '../hooks/api';

export default function ArtikelManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', gambar: null });
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true); setError(null);
    try { const data = await artikelAPI.list(); setItems(data); } catch(e){ setError(e.message);} finally { setLoading(false);} }

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
    <div className="panel">
      <h2>Artikel Manager <span style={{fontSize:'0.7em', fontWeight:'normal'}}>(AI generated)</span></h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="box" style={{marginBottom:'1rem'}}>
        <div>
          <label>Judul<br/>
            <input name="judul" value={form.judul} onChange={onChange} required />
          </label>
        </div>
        <div>
          <label>Isi<br/>
            <textarea name="isi" value={form.isi} onChange={onChange} rows={4} required />
          </label>
        </div>
        <div>
          <label>Gambar {editingId && '(kosongkan jika tidak ganti)'}<br/>
            <input type="file" name="gambar" accept="image/*" onChange={onChange} />
          </label>
        </div>
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={resetForm} style={{marginLeft:8}}>Cancel</button>}
      </form>

      <div>
        <h3>Daftar ({items.length}) {loading && '...loading'}</h3>
        {items.map(a => (
          <div key={a._id} className="card" style={{border:'1px solid #ccc', padding:'8px', marginBottom:'6px', display:'flex', gap:'8px'}}>
            {a.gambar && <img src={imageUrl(a.gambar)} alt="thumb" style={{width:70, height:70, objectFit:'cover', borderRadius:4}} />}
            <div style={{flex:1}}>
              <strong>{a.judul}</strong>
              <div style={{whiteSpace:'pre-wrap', fontSize:'.85em'}}>{a.isi.slice(0,120)}{a.isi.length>120?'...':''}</div>
              <div style={{marginTop:4}}>
                <button type="button" onClick={()=>startEdit(a)}>Edit</button>
                <button type="button" onClick={()=>remove(a._id)} style={{marginLeft:6, color:'red'}}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
