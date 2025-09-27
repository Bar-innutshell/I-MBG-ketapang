import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminArtikel() {
  const [password, setPassword] = useState('');
  const [access, setAccess] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', gambar: null });
  const [editingId, setEditingId] = useState(null);

  const API_BASE = 'http://localhost:3000/api/admin/artikel';

  // --- PASSWORD ---
  const checkPassword = () => {
    if(password === 'admin123') { // ganti sesuai password
      setAccess(true);
    } else {
      alert('Password salah');
    }
  };

  // --- LOAD DATA ---
  const loadArticles = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data.data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(access) loadArticles();
  }, [access]);

  // --- FORM HANDLER ---
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if(files) setForm(f => ({ ...f, [name]: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({ judul: '', isi: '', gambar: null });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('judul', form.judul);
      data.append('isi', form.isi);
      if(form.gambar) data.append('gambar', form.gambar);

      if(editingId) {
        await axios.patch(`${API_BASE}/${editingId}`, data);
      } else {
        await axios.post(API_BASE, data);
      }

      resetForm();
      loadArticles();
    } catch(e) {
      setError(e.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({ judul: item.judul, isi: item.isi, gambar: null });
  };

  const remove = async (id) => {
    if(!window.confirm('Hapus artikel?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      loadArticles();
    } catch(e) {
      setError(e.message);
    }
  };

  // --- RENDER ---
  if(!access) {
    return (
      <div>
        <h2>Login Admin</h2>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan password"/>
        <button onClick={checkPassword}>Masuk</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Admin Artikel Manager</h2>
      {error && <p style={{color:'red'}}>{error}</p>}

      <form onSubmit={submit}>
        <input name="judul" value={form.judul} onChange={onChange} placeholder="Judul" required />
        <textarea name="isi" value={form.isi} onChange={onChange} placeholder="Isi" required />
        <input type="file" name="gambar" accept="image/*" onChange={onChange} />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Daftar Artikel ({articles.length})</h3>
      {loading ? <p>Loading...</p> : articles.map(a => (
        <div key={a._id}>
          <h4>{a.judul}</h4>
          <p>{a.isi}</p>
          {a.gambar && <img src={`http://localhost:3000/${a.gambar}`} alt="thumb" width={100} />}
          <button onClick={()=>startEdit(a)}>Edit</button>
          <button onClick={()=>remove(a._id)}>Hapus</button>
        </div>
      ))}
    </div>
  )
}
