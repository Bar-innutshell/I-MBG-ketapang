import React from 'react'
import { useState } from 'react';
import ArtikelManager from '../components/ArtikelManager';
import ResepManager from '../components/ResepManager';

const Homepage = () => {
  const [tab, setTab] = useState('artikel');
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <h1 className="text-2xl font-semibold">Backend Test Client</h1>
            <span className="text-sm text-slate-500">AI Generated</span>
          </div>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
            Catatan: UI ini dibuat otomatis (AI generated) hanya untuk keperluan uji coba API (CRUD Artikel & Resep). Bukan final desain.
            Silakan tim frontend membangun ulang dengan desain dan pola state management sendiri.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex gap-2 mb-4" role="tablist" aria-label="Data tabs">
          <button
            className={`px-3 py-2 rounded-lg font-semibold transition shadow-sm border ${tab==='artikel' ? 'bg-white text-blue-600 border-blue-100' : 'bg-transparent text-slate-500 border-transparent hover:-translate-y-0.5'}`}
            onClick={() => setTab('artikel')}
            aria-selected={tab === 'artikel'}
          >
            Artikel
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold transition shadow-sm border ${tab==='resep' ? 'bg-white text-blue-600 border-blue-100' : 'bg-transparent text-slate-500 border-transparent hover:-translate-y-0.5'}`}
            onClick={() => setTab('resep')}
            aria-selected={tab === 'resep'}
          >
            Resep
          </button>
        </nav>

        <section>
          {tab === 'artikel' && <ArtikelManager />}
          {tab === 'resep' && <ResepManager />}
        </section>
      </main>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-500">
          Generated helper UI • Gunakan hanya internal dev/testing
        </div>
      </footer>
    </div>
  )
}

export default Homepage