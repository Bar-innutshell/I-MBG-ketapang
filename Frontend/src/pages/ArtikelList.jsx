import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ArtikelList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // untuk navigasi ke detail artikel

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/artikel");
        setArticles(res.data.data || []); 
      } catch (err) {
        console.error(err);
        setError("Gagal memuat artikel. Pastikan server berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const primaryColor = "text-emerald-400";
  const secondaryColor = "text-gray-300";

  if (loading) return <p className={`text-center mt-10 ${secondaryColor}`}>Memuat artikel...</p>;
  if (error) return <p className={`text-center mt-10 text-red-400`}>{error}</p>;
  if (!articles.length)
    return <p className={`text-center mt-10 ${secondaryColor}`}>Belum ada artikel yang tersedia.</p>;

  return (
    <div className="min-h-screen bg-[#070b18] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h2 className={`text-4xl font-bold ${primaryColor} text-center mb-8`}>
          Edukasi & Artikel Sehat 💡
        </h2>

        {articles.map((a) => (
          <div
            key={a._id}
            className="bg-[#121c2c] shadow-xl rounded-xl p-6 flex flex-col sm:flex-row gap-6 border border-transparent hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
          >
                 {a.gambar && (
              <img
                src={`http://localhost:3000/uploads/${encodeURIComponent(a.gambar)}`}
                alt={a.judul}
                crossOrigin="anonymous" // mencegah CORS blocking
                className="w-full sm:w-40 h-40 object-cover rounded-md border border-gray-300"
              />
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white hover:text-emerald-400 transition">
                  {a.judul}
                </h3>
                <p className="text-gray-400 mt-3 text-base line-clamp-3">
                  {a.isi}
                </p>
              </div>
              <button 
                className={`mt-4 text-sm font-medium ${primaryColor} hover:text-emerald-300 self-start focus:outline-none`}
                onClick={() => navigate(`/artikel/${a._id}`)} // navigasi ke detail artikel
              >
                Baca selengkapnya →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
