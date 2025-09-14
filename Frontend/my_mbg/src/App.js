import React, { useState } from 'react';
import './App.css';
import ArtikelManager from './components/ArtikelManager';
import ResepManager from './components/ResepManager';

function App() {
  const [tab, setTab] = useState('artikel');
  return (
    <div className="App" style={{padding:'1rem', maxWidth:1200, margin:'0 auto', textAlign:'left'}}>
      <h1 style={{marginTop:0}}>Backend Test Client <span style={{fontSize:'0.6em', fontWeight:'normal'}}>AI Generated</span></h1>
      <p style={{marginTop:0, fontSize:'0.85em', lineHeight:1.4}}>
        Catatan: UI ini dibuat otomatis (AI generated) hanya untuk keperluan uji coba API (CRUD Artikel & Resep). Bukan final desain.
        Silakan tim frontend membangun ulang dengan desain dan pola state management sendiri.
      </p>
      <div style={{display:'flex', gap:'8px', marginBottom:'1rem'}}>
        <button onClick={()=>setTab('artikel')} disabled={tab==='artikel'}>Artikel</button>
        <button onClick={()=>setTab('resep')} disabled={tab==='resep'}>Resep</button>
      </div>
      {tab === 'artikel' && <ArtikelManager />}
      {tab === 'resep' && <ResepManager />}
      <footer style={{marginTop:'3rem', fontSize:'0.7em', opacity:0.7}}>
        Generated helper UI • Gunakan hanya internal dev/testing
      </footer>
    </div>
  );
}

export default App;
