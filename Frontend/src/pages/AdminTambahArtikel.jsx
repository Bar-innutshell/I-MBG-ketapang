import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminArtikel() {
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "", gambar: null });
  const [preview, setPreview] = useState(null); // untuk preview gambar
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "http://localhost:3000/api/admin/artikel";

  // --- Login ---
  const checkPassword = () => {
    if (password === "admin123") setAccess(true);
    else alert("Password salah");
  };

  // --- Load Data ---
  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data.data || []);
    } catch (e) {
      setError(e.message);
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
    if (files) {
      const file = files[0];
      setForm((f) => ({ ...f, [name]: file }));
      setPreview(URL.createObjectURL(file)); // tampilkan preview
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
    try {
      const data = new FormData();
      data.append("judul", form.judul);
      data.append("isi", form.isi);
      if (form.gambar) data.append("gambar", form.gambar);

      if (editingId) {
        await axios.patch(`${API_BASE}/${editingId}`, data);
      } else {
        await axios.post(API_BASE, data);
      }

      resetForm();
      loadArticles();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({ judul: item.judul, isi: item.isi, gambar: null });
    setPreview(item.gambar ? `http://localhost:3000/${item.gambar}` : null);
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus artikel?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      loadArticles();
    } catch (e) {
      setError(e.message);
    }
  };

  // --- Login View ---
  if (!access) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="bg-gray-800 p-6 rounded-xl shadow-md w-80">
          <h2 className="text-xl font-bold mb-4 text-center">Login Admin</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring focus:ring-green-500"
          />
          <button
            onClick={checkPassword}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-400">Admin Artikel</h2>
          <p className="text-gray-400">Kelola artikel website Anda</p>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-center">⚠ {error}</p>}

        {/* Form */}
        <div className="bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Artikel" : "Buat Artikel Baru"}
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <input
              name="judul"
              value={form.judul}
              onChange={onChange}
              placeholder="Judul"
              required
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-500"
            />
            <textarea
              name="isi"
              value={form.isi}
              onChange={onChange}
              placeholder="Isi artikel..."
              required
              rows="5"
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-500"
            />
            <div>
              <input
                type="file"
                name="gambar"
                accept="image/*"
                onChange={onChange}
                className="block text-gray-300"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-3 w-40 h-40 object-cover rounded-md border border-gray-700"
                />
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Artikel */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">
            Daftar Artikel{" "}
            <span className="text-green-400">({articles.length})</span>
          </h3>

          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : articles.length === 0 ? (
            <p className="text-center text-gray-400">Belum ada artikel.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((a) => (
                <div
                  key={a._id}
                  className="bg-gray-800 shadow p-5 rounded-xl flex flex-col sm:flex-row gap-5"
                >
                  {a.gambar && (
<img
  src={`http://localhost:3000/uploads/${encodeURIComponent(a.gambar)}`}
  alt={a.judul}
  crossOrigin="anonymous"
  className="w-full sm:w-40 h-40 object-cover rounded-md border border-gray-300"
/>


                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-green-400">
                      {a.judul}
                    </h4>
                    <p className="text-gray-300 mt-1 whitespace-pre-line">
                      {a.isi}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => startEdit(a)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(a._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-medium"
                      >
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
  );
}
