import { Routes, Route } from 'react-router';
import './index.css';
import ArtikelManager from './components/ArtikelManager';
import ResepManager from './components/ResepManager';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {

  return (
  <div className="min-h-screen bg-base app-background text-base-foreground selection:bg-emerald-300/40 transition-colors duration-200">
      <Navbar />
      <main className="pt-20">{/* offset for fixed navbar */}
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/artikel" element={<ArtikelManager />} />
          <Route path="/resep" element={<ResepManager />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
