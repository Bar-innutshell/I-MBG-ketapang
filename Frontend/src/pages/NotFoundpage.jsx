import React from 'react'
import { Link } from 'react-router'

const NotFoundpage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <header className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200">I-MBG Ketapang</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-8xl font-bold text-slate-800 dark:text-slate-200">404</p>
          <h2 className="mt-2 text-2xl font-semibold">Halaman tidak ditemukan</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} I-MBG Ketapang</div>
      </footer>
    </div>
  )
}

export default NotFoundpage;