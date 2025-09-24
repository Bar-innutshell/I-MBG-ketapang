import React from 'react'
import { Link } from 'react-router'

const NotFoundpage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold text-slate-700">I-MBG Ketapang</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p className="text-8xl font-bold text-slate-800">404</p>
          <h2 className="mt-2 text-2xl font-semibold">Halaman tidak ditemukan</h2>
          <p className="mt-2 text-slate-600">Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-500">&copy; {new Date().getFullYear()} I-MBG Ketapang</div>
      </footer>
    </div>
  )
}

export default NotFoundpage;