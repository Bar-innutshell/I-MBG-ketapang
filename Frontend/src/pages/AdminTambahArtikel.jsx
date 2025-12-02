import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 
import { Lock, FileText, Image, Link as LinkIcon, Pencil, Trash2 } from "lucide-react";

export default function AdminArtikel() {
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "", gambar: null, gambarUrl: "" });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [useUrlMode, setUseUrlMode] = useState(false);

  const API_BASE = "http://localhost:3000/api/admin/artikel";

  const checkPassword = () => {
    if (password === "admin123") setAccess(true);
    else alert("Password salah");
  };

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data.data || []);
    } catch (e) {
      setError("Gagal memuat data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access) loadArticles();
  }, [access]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setForm((f) => ({ ...f, [name]: file, gambarUrl: "" }));
      setPreview(URL.createObjectURL(file));
      setUseUrlMode(false);
    } else if (name === "gambarUrl") {
      setForm((f) => ({ ...f, gambarUrl: value, gambar: null }));
      setPreview(value || null);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({ judul: "", isi: "", gambar: null, gambarUrl: "" });
    setPreview(null);
    setEditingId(null);
    setUseUrlMode(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("judul", form.judul);
      data.append("isi", form.isi);
      
      if (form.gambar) {
        data.append("gambar", form.gambar);
      } else if (form.gambarUrl && form.gambarUrl.trim()) {
        data.append("gambarUrl", form.gambarUrl.trim());
      }

      if (editingId) {
        await axios.patch(`${API_BASE}/${editingId}`, data);
      } else {
        await axios.post(API_BASE, data);
      }

      resetForm();
      loadArticles();
    } catch (e) {
      setError("Gagal menyimpan artikel: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    const isExternalUrl = item.gambar && (item.gambar.startsWith('http://') || item.gambar.startsWith('https://'));
    setForm({ 
      judul: item.judul, 
      isi: item.isi, 
      gambar: null, 
      gambarUrl: isExternalUrl ? item.gambar : "" 
    });
    setUseUrlMode(isExternalUrl);
    if (isExternalUrl) {
      setPreview(item.gambar);
    } else {
      setPreview(item.gambar ? `http://localhost:3000/uploads/${encodeURIComponent(item.gambar)}` : null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Yakin ingin HAPUS permanen artikel ini?")) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE}/${id}`);
      loadArticles();
    } catch (e) {
      setError("Gagal menghapus artikel: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Login View ---
  if (!access) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base">
        <div className="card-base p-8 w-96">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-4">
              <Lock className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Admin Login
            </h2>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password admin"
            className="input-base w-full mb-4"
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
          />
          <button
            onClick={checkPassword}
            className="btn-primary w-full"
          >
            Masuk Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Panel Admin Artikel
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola, sunting, dan hapus konten artikel website Anda.
          </p>
        </div>

        {/* Notifikasi Loading/Error */}
        {(loading || error) && (
          <div className={`p-4 rounded-xl text-center font-medium ${
            error 
              ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' 
              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
          }`}>
            {loading ? "Memproses data..." : `⚠ ${error}`}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* === Form Tambah/Edit Artikel === */}
          <div className="lg:col-span-1">
            <div className="card-base p-6 sticky top-24">
              <h3 className="text-xl font-bold text-foreground mb-6 pb-3 border-b border-default flex items-center gap-2">
                <FileText size={20} className="text-emerald-500" />
                {editingId ? "Sunting Artikel" : "Buat Artikel Baru"}
              </h3>
              <form onSubmit={submit} className="space-y-4">
                <input
                  name="judul"
                  value={form.judul}
                  onChange={onChange}
                  placeholder="Judul Artikel..."
                  required
                  className="input-base"
                />
                
                <textarea
                  name="isi"
                  value={form.isi}
                  onChange={onChange}
                  placeholder="Isi artikel..."
                  required
                  rows="8"
                  className="input-base resize-none"
                />
                
                {/* Input dan Preview Gambar */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {editingId ? "Ganti Gambar (Opsional)" : "Pilih Gambar Utama"}
                  </label>
                  
                  {/* Toggle antara File Upload dan URL */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setUseUrlMode(false); setForm(f => ({ ...f, gambarUrl: "" })); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        !useUrlMode 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-muted text-foreground hover:opacity-80'
                      }`}
                    >
                      <Image size={14} />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUseUrlMode(true); setForm(f => ({ ...f, gambar: null })); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        useUrlMode 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-muted text-foreground hover:opacity-80'
                      }`}
                    >
                      <LinkIcon size={14} />
                      URL Imgur
                    </button>
                  </div>

                  {!useUrlMode ? (
                    <input
                      type="file"
                      name="gambar"
                      accept="image/*"
                      onChange={onChange}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 transition duration-150"
                    />
                  ) : (
                    <input
                      type="url"
                      name="gambarUrl"
                      value={form.gambarUrl}
                      onChange={onChange}
                      placeholder="https://i.imgur.com/xxxxx.jpg"
                      className="input-base"
                    />
                  )}
                  
                  {preview && (
                    <div className="mt-4 relative w-full h-48">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover rounded-xl border-2 border-default"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => { setPreview(null); setForm(f => ({ ...f, gambar: null, gambarUrl: "" })); }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : (editingId ? "Update Artikel" : "Publish Artikel")}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* === List Artikel === */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-6 pb-3 border-b border-default">
              Daftar Artikel <span className="text-emerald-600 dark:text-emerald-400">({articles.length})</span>
            </h3>

            {articles.length === 0 ? (
              <div className="card-base p-10 text-center">
                <p className="text-muted-foreground">
                  Belum ada artikel yang dipublikasikan. Silahkan buat yang baru!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((a) => (
                  <div
                    key={a._id}
                    className="card-base p-5 flex flex-col md:flex-row gap-5"
                  >
                    {/* Gambar Thumbnail */}
                    {a.gambar && (() => {
                      const isExternalImage = a.gambar.startsWith('http');
                      return (
                        <img
                          src={isExternalImage ? a.gambar : `http://localhost:3000/uploads/${encodeURIComponent(a.gambar)}`}
                          alt={a.judul}
                          {...(!isExternalImage && { crossOrigin: "anonymous" })}
                          className="w-full md:w-44 h-32 object-cover rounded-xl bg-slate-100 dark:bg-slate-700"
                          onError={(e) => { 
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="176" height="128" viewBox="0 0 176 128"><rect fill="%23e2e8f0" width="176" height="128"/><text fill="%2394a3b8" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
                          }}
                        />
                      );
                    })()}
                    {/* Detail Artikel */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {a.judul}
                        </h4>
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {a.isi}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          ID: {a._id.substring(0, 8)}...
                        </span>
                      </div>
                      {/* Tombol Aksi */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => startEdit(a)}
                          className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg font-medium text-sm hover:opacity-80 transition-opacity"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => remove(a._id)}
                          className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium text-sm hover:opacity-80 transition-opacity"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}