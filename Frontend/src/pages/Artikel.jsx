import React from 'react';
// 1. Import komponen yang berisi Form dan Daftar Artikel
import ArtikelManager from '../components/ArtikelManager';

export const Artikel = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 2. Panggil komponen ArtikelManager di sini */}
      <ArtikelManager />
    </div>
  );
}

// Perhatikan: Anda menggunakan named export (export const Artikel) 
// dan default export (export default Artikel). 
// Karena di App.jsx Anda menggunakan default import, pastikan default export ini ada.
export default Artikel;