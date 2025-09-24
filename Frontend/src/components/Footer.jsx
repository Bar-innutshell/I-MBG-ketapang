import React from 'react';
import { Github, Mail } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">I-MBG Ketapang</div>
            <div className="text-xs">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
            <Link to="/artikel" className="hover:text-emerald-600 dark:hover:text-emerald-400">Artikel</Link>
            <Link to="/resep" className="hover:text-emerald-600 dark:hover:text-emerald-400">Resep</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="hover:text-emerald-600 dark:hover:text-emerald-400"><Github size={18} /></a>
            <a href="#" aria-label="Email" className="hover:text-emerald-600 dark:hover:text-emerald-400"><Mail size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
