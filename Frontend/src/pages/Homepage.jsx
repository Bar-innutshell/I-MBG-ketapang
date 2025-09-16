import React from 'react'
import { useState } from 'react';
import ArtikelManager from '../components/ArtikelManager';
import ResepManager from '../components/ResepManager';

const Homepage = () => {
    const [tab, setTab] = useState('artikel');
  return (
    <div className="homepage-root">
      <header className="site-header">
        <div className="container">
          <div className="title-wrap">
            <h1>Backend Test Client</h1>
            <span className="muted">AI Generated</span>
          </div>
          <p className="lead">
            Catatan: UI ini dibuat otomatis (AI generated) hanya untuk keperluan uji coba API (CRUD Artikel & Resep). Bukan final desain.
            Silakan tim frontend membangun ulang dengan desain dan pola state management sendiri.
          </p>
        </div>
      </header>

      <main className="container main-content">
        <nav className="tabs" role="tablist" aria-label="Data tabs">
          <button
            className={"tab-btn " + (tab === 'artikel' ? 'active' : '')}
            onClick={() => setTab('artikel')}
            aria-selected={tab === 'artikel'}
          >
            Artikel
          </button>
          <button
            className={"tab-btn " + (tab === 'resep' ? 'active' : '')}
            onClick={() => setTab('resep')}
            aria-selected={tab === 'resep'}
          >
            Resep
          </button>
        </nav>

        <section className="panel">
          {tab === 'artikel' && <ArtikelManager />}
          {tab === 'resep' && <ResepManager />}
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          Generated helper UI • Gunakan hanya internal dev/testing
        </div>
      </footer>
    </div>
  )
}

export default Homepage