import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ArtikelDetail() {
  const { id } = useParams(); // ambil ID dari URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/artikel/${id}`);
        setArticle(res.data.data); // pastikan API merespon { data: { ...artikel } }
      } catch (err) {
        console.error(err);
        setError("Artikel tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Memuat artikel...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (!article) return null;

  return (
    <div className="min-h-screen bg-[#070b18] p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/" className="text-emerald-400 hover:text-emerald-300">&larr; Kembali</Link>
        <h1 className="text-4xl font-bold text-emerald-400">{article.judul}</h1>
        {article.gambar && (
          <img
            src={`http://localhost:3000/uploads/${encodeURIComponent(article.gambar)}`}
            alt={article.judul}
            className="w-full max-h-96 object-cover rounded-md border border-gray-700"
          />
        )}
        <p className="text-gray-300 whitespace-pre-line">{article.isi}</p>
      </div>
    </div>
  );
}
