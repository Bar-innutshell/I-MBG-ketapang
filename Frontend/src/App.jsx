import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Resep from './pages/Resep.jsx';
import Edukasi from './pages/Edukasi.jsx';
import CompareGizi from './pages/CompareGizi.jsx';
import Homepage from './pages/Homepage.jsx';
import NotFoundpage from './pages/NotFoundpage.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import './index.css';
import AsupanHarian from './pages/AsupanHarian.jsx';
import ToastHost from './components/ToastHost.jsx';
import GiziDetail from './pages/GiziDetail.jsx';
import ArtikelList from "./pages/ArtikelList.jsx";
import AdminTambahArtikel from "./pages/AdminTambahArtikel.jsx";
import ArtikelDetail from "./pages/ArtikelDetail.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-base app-background text-foreground selection:bg-emerald-300/40 transition-colors duration-200">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/artikel" element={<ArtikelList />} />
          <Route path="/artikel/:id" element={<ArtikelDetail />} /> 
          <Route path="/resep" element={<Resep />} />
          <Route path="/compare-gizi" element={<CompareGizi />} />
          <Route path="/edukasi" element={<Edukasi />} />
          <Route path="/asupan-harian" element={<AsupanHarian />} />
          {/* Admin */}
          <Route path="/admin/tambah" element={<AdminTambahArtikel />} />
          <Route path="*" element={<NotFoundpage />} />
        </Routes>
      </main>
      <Footer />
      <ToastHost />
    </div>
  );
}
