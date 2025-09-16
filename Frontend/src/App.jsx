import {Routes , Route} from 'react-router';
import './index.css';
import ArtikelManager from './components/ArtikelManager';
import ResepManager from './components/ResepManager';
import Homepage from './pages/Homepage';
import { useState } from 'react';

function App() {

  return (
    
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/artikel" element={<ArtikelManager />} />
      <Route path="/resep" element={<ResepManager />} />
    </Routes>
  );
}

export default App;
