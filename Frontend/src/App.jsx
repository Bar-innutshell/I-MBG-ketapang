import { Routes, Route } from 'react-router-dom'
// Ganti default import menjadi named import sesuai nama export di masing-masing file:
import Artikel from './pages/Artikel.jsx'
import Resep from './pages/Resep.jsx'
import Edukasi from './pages/Edukasi.jsx'
import CompareGizi from './pages/CompareGizi.jsx'
import Homepage from './pages/Homepage.jsx'
import NotFoundpage from './pages/NotFoundpage.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import './index.css';

export default function App() {
  return (
  <div className="min-h-screen bg-base app-background text-base-foreground selection:bg-emerald-300/40 transition-colors duration-200">
      <Navbar />
      <main className="pt-20">{/* offset for fixed navbar */}
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/resep" element={<Resep />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/edukasi" element={<Edukasi />} />
          <Route path="/compare-gizi" element={<CompareGizi />} />
          <Route path="*" element={<NotFoundpage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
