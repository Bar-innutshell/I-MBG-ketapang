import React from 'react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-default bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-foreground">I-MBG Ketapang</div>
            <div className="text-xs">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:underline text-foreground">Home</Link>
            <Link to="/artikel" className="hover:underline text-foreground">Artikel</Link>
            <Link to="/resep" className="hover:underline text-foreground">Resep</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
