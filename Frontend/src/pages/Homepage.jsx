import React from 'react';
import { useNavigate } from 'react-router';
import { Flame, Apple, BookOpen, GraduationCap, Link as LinkIcon, TrendingUp } from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();

  const stats = [
    { icon: <Apple className="text-emerald-500" size={22} />, value: '1000+', label: 'Makanan' },
    { icon: <BookOpen className="text-emerald-500" size={22} />, value: '200+', label: 'Resep' },
    { icon: <TrendingUp className="text-emerald-500" size={22} />, value: '50k+', label: 'Pengguna' },
    { icon: <Flame className="text-emerald-500" size={22} />, value: '95%', label: 'Kepuasan' },
  ];

  const features = [
    { title: 'Gizi Makanan', desc: 'Cari dan pelajari kandungan gizi ribuan makanan Indonesia', icon: Apple },
    { title: 'Resep Sehat', desc: 'Koleksi resep bergizi dengan informasi nutrisi lengkap', icon: BookOpen },
    { title: 'Bandingkan', desc: 'Bandingkan nilai gizi antar makanan dan resep', icon: LinkIcon },
    { title: 'Edukasi', desc: 'Artikel dan tips untuk hidup lebih sehat', icon: GraduationCap },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-emerald-500/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur p-8 md:p-12 text-center shadow-sm">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">Nutrisi Sehat</span>
            <br />
            <span className="text-slate-900 dark:text-white">Dimulai dari Sini</span>
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Temukan informasi gizi lengkap, resep sehat, dan edukasi nutrisi untuk hidup yang lebih baik
          </p>

          {/* Search mock */}
          <div className="mt-6 flex items-center gap-2 justify-center">
            <input
              placeholder="Cari makanan atau resep..."
              className="w-full max-w-xl rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-800/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button className="rounded-xl bg-emerald-500 text-white px-4 py-3 hover:bg-emerald-600">Cari Sekarang</button>
          </div>

          <div className="mt-3 text-xs text-slate-500">Populer: Nasi goreng • Ayam bakar • Gado-gado • Tempe goreng</div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                {s.icon}
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
              </div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">Fitur Unggulan</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Semua yang Anda butuhkan untuk memahami dan mengelola nutrisi harian</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {features.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-emerald-400/10 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-3">
                <Icon size={18} />
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Picks (static mock cards) */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Quick Picks</h3>
          <span className="text-xs text-emerald-500 inline-flex items-center gap-1"><TrendingUp size={14}/> Trending</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {["Nasi Putih","Ayam Bakar","Indomie Goreng","Tahu Putih"].map((name, idx)=> (
            <div key={name} className="rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-white/70 dark:bg-slate-900/70">
              <div className="h-36 bg-slate-200 dark:bg-slate-800" />
              <div className="p-4">
                <div className="font-semibold">{name}</div>
                <div className="text-xs text-slate-500">{idx%2===0? '100g • 165 kkal':'80g • 344 kkal'}</div>
                <div className="mt-2 flex gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">P: 7g</span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300">L: 4g</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">K: 49g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:from-emerald-400/10 dark:to-transparent p-10 text-center">
          <div className="text-3xl">⚡</div>
          <h3 className="mt-2 text-2xl md:text-3xl font-bold">Mulai Perjalanan Sehat Anda</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Bergabung dengan orang yang telah mengubah pola makan mereka dengan I-MBG</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={()=>navigate('/artikel')} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Mulai Eksplorasi</button>
            <button onClick={()=>navigate('/resep')} className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Pelajari Lebih Lanjut</button>
          </div>
        </div>
      </section>
    </div>
  );
}