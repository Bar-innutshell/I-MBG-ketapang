import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

export default function ArtikelList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

  if (loading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Memuat artikel...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="text-red-500 dark:text-red-400">{error}</p>
    </div>
  );

  if (!articles.length) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="text-muted-foreground">Belum ada artikel yang tersedia.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-4">
            <BookOpen className="text-emerald-600 dark:text-emerald-400" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            Edukasi & Artikel Sehat
          </h1>
          <p className="text-muted-foreground">
            Pelajari tips kesehatan dan nutrisi untuk hidup lebih baik
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid gap-6">
          {articles.map((a) => {
            const isExternalImage = a.gambar && a.gambar.startsWith('http');
            const imageUrl = isExternalImage ? a.gambar : (a.gambar ? `http://localhost:3000/uploads/${encodeURIComponent(a.gambar)}` : null);
            
            return (
              <article
                key={a._id}
                className="card-base p-6 flex flex-col sm:flex-row gap-6 cursor-pointer group"
                onClick={() => navigate(`/artikel/${a._id}`)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={a.judul}
                    {...(!isExternalImage && { crossOrigin: "anonymous" })}
                    className="w-full sm:w-44 h-44 object-cover rounded-xl bg-slate-100 dark:bg-slate-700"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176" viewBox="0 0 176 176"><rect fill="%23e2e8f0" width="176" height="176"/><text fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>'; 
                    }}
                  />
                ) : (
                  <div className="w-full sm:w-44 h-44 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground text-sm">
                    No Image
                  </div>
                )}
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {a.judul}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-base line-clamp-3">
                      {a.isi}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all">
                    <span>Baca selengkapnya</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
