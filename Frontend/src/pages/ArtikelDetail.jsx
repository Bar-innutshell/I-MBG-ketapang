import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export default function ArtikelDetail() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/artikel/${id}`);
        console.log("Response detail artikel:", res.data);
        setArtikel(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail artikel.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtikel();
  }, [id]);

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

  if (!artikel) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="text-muted-foreground">Artikel tidak ditemukan.</p>
    </div>
  );

  const gambarName =
    typeof artikel.gambar === "string"
      ? artikel.gambar
      : artikel.gambar?.filename || artikel.gambar?.path?.split("/").pop();

  const publishDate = "23 April 2024"; 
  const readTime = artikel.waktu_baca || "3 menit";

  return (
    <div className="min-h-screen bg-base text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        {/* Article Card */}
        <article className="card-base overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4">
              {artikel.judul}
            </h1>
            
            {/* Metadata */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground pb-4 border-b border-default">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-emerald-500" />
                <span>Admin</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-500" />
                <span>{publishDate}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span>{readTime}</span>
              </span>
            </div>
          </div>
          
          {/* Image */}
          {gambarName && (() => {
            const isExternalImage = gambarName.startsWith('http');
            const imageUrl = isExternalImage ? gambarName : `http://localhost:3000/uploads/${encodeURIComponent(gambarName)}`;
            return (
              <div className="px-6 md:px-8 pb-6">
                <img
                  src={imageUrl}
                  alt={artikel.judul}
                  {...(!isExternalImage && { crossOrigin: "anonymous" })}
                  className="w-full h-auto max-h-[500px] object-cover object-center rounded-xl bg-slate-100 dark:bg-slate-700" 
                  onError={(e) => { 
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect fill="%23e2e8f0" width="800" height="400"/><text fill="%2394a3b8" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dy=".3em">Gambar tidak dapat dimuat</text></svg>';
                  }}
                />
              </div>
            );
          })()}
          
          {/* Article Content */}
          <div className="p-6 md:p-8 pt-2">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="leading-8 text-foreground whitespace-pre-line text-lg">
                {artikel.isi}
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 md:p-8 bg-muted border-t border-default text-center">
            <button
              onClick={() => navigate('/artikel')} 
              className="btn-primary"
            >
              Lihat Artikel Lainnya
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}