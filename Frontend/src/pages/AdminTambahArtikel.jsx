import React, { useEffect, useState } from "react";
import axios from "axios";
// Import Link untuk navigasi ke detail artikel jika diperlukan
import { Link } from "react-router-dom"; 

export default function AdminArtikel() {
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "", gambar: null });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // URL yang diperbaiki
  const API_BASE = "http://localhost:3000/api/admin/artikel";

  // --- Login ---
  const checkPassword = () => {
    // Password harusnya disimpan lebih aman, tapi untuk contoh ini kita biarkan.
    if (password === "admin123") setAccess(true);
    else alert("Password salah");
  };

  // --- Load Data ---
  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE);
      // Memastikan data yang diterima adalah array
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

  // --- Form Handler ---
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setForm((f) => ({ ...f, [name]: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({ judul: "", isi: "", gambar: null });
    setPreview(null);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("judul", form.judul);
      data.append("isi", form.isi);
      // Hanya tambahkan gambar jika ada file baru
      if (form.gambar) {
        data.append("gambar", form.gambar);
      } else if (editingId && preview && !form.gambar && preview.includes('uploads/')) {
        // Logika untuk menandai bahwa gambar tidak diubah/tetap menggunakan yang lama
        // Ini tergantung implementasi backend Anda. Jika backend mengabaikan field yang kosong, kode ini tidak perlu.
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
    // Saat edit, set form.gambar ke null, tetapi set preview ke URL gambar lama
    setForm({ judul: item.judul, isi: item.isi, gambar: null });
    // Asumsi item.gambar berisi nama file, kita buat URL lengkapnya untuk preview
    setPreview(item.gambar ? `http://localhost:3000/uploads/${encodeURIComponent(item.gambar)}` : null);
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

  // --- Login View (Desain Ditingkatkan) ---
  if (!access) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b18] text-white">
        <div className="bg-[#0F172A] p-8 rounded-2xl shadow-2xl w-96 border border-gray-700">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-emerald-400">
            ADMIN LOGIN 
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password admin"
            className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
          <button
            onClick={checkPassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-[1.01] transition-transform"
          >
            Masuk Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard View (Desain Ditingkatkan) ---
  return (
    <div className="min-h-screen bg-[#070b18] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-emerald-400">Panel Admin Artikel </h2>
          <p className="text-gray-400 mt-2">Kelola, sunting, dan hapus konten artikel website Anda.</p>
        </div>

        {/* Notifikasi Loading/Error */}
        {(loading || error) && (
            <div className={`p-4 rounded-lg text-center font-medium ${error ? 'bg-red-800/50 text-red-300 border border-red-700' : 'bg-blue-800/50 text-blue-300 border border-blue-700'}`}>
                {loading ? "Memproses data..." : `⚠ ${error}`}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* === Kolom 1: Form Tambah/Edit Artikel === */}
            <div className="lg:col-span-1 bg-[#0F172A] rounded-2xl shadow-xl p-6 h-fit sticky top-10 border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
                    {editingId ? " Sunting Artikel" : " Buat Artikel Baru"}
                </h3>
                <form onSubmit={submit} className="space-y-5">
                    
                    {/* Input Judul */}
                    <input
                        name="judul"
                        value={form.judul}
                        onChange={onChange}
                        placeholder="Judul Artikel..."
                        required
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                    />
                    
                    {/* Textarea Isi Artikel */}
                    <textarea
                        name="isi"
                        value={form.isi}
                        onChange={onChange}
                        placeholder="Isi artikel..."
                        required
                        rows="8"
                        className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 resize-none"
                    />
                    
                    {/* Input dan Preview Gambar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            {editingId ? "Ganti Gambar (Opsional)" : "Pilih Gambar Utama"}
                        </label>
                        <input
                            type="file"
                            name="gambar"
                            accept="image/*"
                            onChange={onChange}
                            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 transition duration-150"
                        />
                        {preview && (
                            <div className="mt-4 relative w-full h-48">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-full object-cover rounded-lg border-2 border-gray-600"
                                />
                                {editingId && form.gambar && (
                                     <button 
                                        type="button" 
                                        onClick={() => setPreview(null)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full text-sm font-bold leading-none flex items-center justify-center transition-colors"
                                     >
                                        &times;
                                     </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            className={`flex-1 ${editingId ? "bg-emerald-600 hover:bg-emerald-700" : "bg-green-600 hover:bg-green-700"} text-white px-5 py-2.5 rounded-xl font-bold text-lg transform hover:scale-[1.01] transition-transform`}
                            disabled={loading}
                        >
                            {loading ? "Menyimpan..." : (editingId ? "UPDATE ARTIKEL" : "PUBLISH ARTIKEL")}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* === Kolom 2: List Artikel === */}
            <div className="lg:col-span-2">
                <h3 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
                    Daftar Artikel <span className="text-emerald-400">({articles.length})</span>
                </h3>

                {articles.length === 0 ? (
                    <p className="text-center text-xl text-gray-500 p-10 bg-[#0F172A] rounded-xl shadow-inner">
                        Belum ada artikel yang dipublikasikan. Silahkan buat yang baru!
                    </p>
                ) : (
                    <div className="space-y-6">
                        {articles.map((a) => (
                            <div
                                key={a._id}
                                className="bg-[#0F172A] shadow-lg p-5 rounded-xl flex flex-col md:flex-row gap-5 border border-gray-700 hover:border-emerald-500 transition-colors"
                            >
                                {/* Gambar Thumbnail */}
                                {a.gambar && (
                                    <img
                                        src={`http://localhost:3000/uploads/${encodeURIComponent(a.gambar)}`}
                                        alt={a.judul}
                                        crossOrigin="anonymous"
                                        className="w-full md:w-48 h-32 object-cover rounded-lg border-2 border-gray-600/50"
                                    />
                                )}
                                {/* Detail Artikel */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                                            {/* Anda bisa menggunakan Link untuk melihat detail artikel di frontend */}
                                            {/* <Link to={`/artikel/${a._id}`}>{a.judul}</Link> */}
                                            {a.judul}
                                        </h4>
                                        <p className="text-gray-300 mt-1 line-clamp-2">
                                            {a.isi}
                                        </p>
                                        <span className="text-sm text-gray-500 mt-2 block">
                                            ID: {a._id.substring(0, 8)}...
                                        </span>
                                    </div>
                                    {/* Tombol Aksi */}
                                    <div className="flex gap-3 mt-4 self-end md:self-auto">
                                        <button
                                            onClick={() => startEdit(a)}
                                            className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => remove(a._id)}
                                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors text-sm"
                                        >
                                            🗑️ Hapus
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