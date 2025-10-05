import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
        // Sesuaikan jika data artikel tidak langsung di res.data
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

  if (loading) return <p className="text-center text-gray-300 mt-10">Memuat...</p>;
  if (error) return <p className="text-center text-red-400 mt-10">{error}</p>;
  if (!artikel) return <p className="text-center text-gray-300 mt-10">Artikel tidak ditemukan.</p>;

  const gambarName =
    typeof artikel.gambar === "string"
      ? artikel.gambar
      : artikel.gambar?.filename || artikel.gambar?.path?.split("/").pop();

  // Data dummy tambahan (Ganti dengan data API Anda!)
  // Menggunakan tanggal hari ini sebagai placeholder
  const publishDate = "23 April 2024"; 
  const readTime = artikel.waktu_baca || "3 menit";
  const views = artikel.jumlah_views || 15; 
  const likes = artikel.jumlah_likes || 3; 

  return (
    // Latar belakang utama (tetap gelap)
    <div className="min-h-screen bg-[#070b18] text-gray-300 p-4 sm:p-6 lg:p-8">
      {/* Container utama dengan warna yang sedikit berbeda dari background */}
      <div className="max-w-4xl mx-auto bg-[#0F172A] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Tombol Kembali (di pojok atas) */}
        <div className="p-6 md:p-10 pb-0">
          <button
              onClick={() => navigate(-1)}
              className="text-emerald-400 hover:text-emerald-300 text-lg font-medium flex items-center gap-1 transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
          </button>
        </div>
        
        {/* === Header (Judul & Metadata) === */}
        <div className="p-6 md:p-10 pt-4">
            {/* Judul Artikel */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              {artikel.judul}
            </h1>
            
            {/* Info Penulis dan Metadata */}
            <div className="flex items-center text-gray-400 text-sm flex-wrap gap-y-1 border-b border-gray-700/50 pb-4">
              
              <span className="mr-4">
                Ditulis oleh: <strong className="font-semibold text-emerald-400">Admin</strong>
              </span>
              <span className="mr-4 text-gray-600">|</span>
              
              <span className="mr-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {publishDate}
              </span>
              <span className="mr-4 text-gray-600">|</span>
              
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readTime}
              </span>
            </div>
        </div>
        
        {/* === Visual Section (Gambar Utama) === */}
        {gambarName && (
            <div className="px-6 md:px-10 pb-6 md:pb-10">
                <img
                src={`http://localhost:3000/uploads/${encodeURIComponent(gambarName)}`}
                alt={artikel.judul}
                crossOrigin="anonymous"
                className="w-full h-auto max-h-[500px] object-cover object-center rounded-lg shadow-xl" 
                />
            </div>
        )}
        
        {/* === Article Body (Isi Artikel) === */}
        <div className="p-6 md:p-10 pt-0 text-gray-200 leading-relaxed text-lg">
          
          {/* Paragraf Utama: Isi artikel akan diletakkan di sini. */}
          <p className="leading-8 text-gray-300 whitespace-pre-line mb-6">
            {artikel.isi}
          </p>
          
          {/* Anda bisa menambahkan elemen styling seperti sub-heading di sini: */}
          {/* <h2 className="text-3xl font-bold text-white mt-10 mb-4">Sub Judul (Opsional)</h2>
          <p className="leading-8 text-gray-300 mb-6">
            Ini adalah paragraf lanjutan yang bisa memuat detail tambahan. Pastikan untuk memecah teks menjadi bagian yang mudah dicerna.
          </p>
          
          <ul className="list-disc list-inside ml-4 space-y-2 text-gray-300">
            <li>Poin utama yang disorot dengan list.</li>
            <li>Menggunakan list membuat informasi lebih mudah di-scan.</li>
            <li>Jangan takut menggunakan spasi (margin) antar elemen.</li>
          </ul> */}

        </div>

        {/* --- Separator --- */}
        <hr className="border-gray-700 mx-6 md:mx-10" />

        {/* === Footer / CTA === */}
        <div className="p-6 bg-[#070b18] text-center border-t border-gray-700/50">
          <button
            onClick={() => navigate('/artikel')} 
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Lihat Artikel Lainnya
          </button>
        </div>
      </div>
    </div>
  );
}