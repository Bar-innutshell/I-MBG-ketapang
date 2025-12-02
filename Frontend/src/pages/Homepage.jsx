import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useDebounce from '../hooks/useDebounce'
import { searchGizi } from '../hooks/api'
import { Flame, Apple, BookOpen, GraduationCap, Link as LinkIcon, TrendingUp, RefreshCw } from 'lucide-react'

export default function Homepage() {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()
  const debounced = useDebounce(term, 300)
  const [sug, setSug] = useState({ open: false, loading: false, items: [] })
  
  // State untuk Quick Picks dari TheMealDB
  const [quickPicks, setQuickPicks] = useState([])
  const [quickPicksLoading, setQuickPicksLoading] = useState(true)
  const hasFetchedRef = useRef(false)

  // Fetch random meals dari TheMealDB
  const fetchRandomMeals = async () => {
    setQuickPicksLoading(true)
    try {
      // TheMealDB random endpoint hanya return 1 meal, jadi kita fetch 4x
      const promises = Array(4).fill(null).map(() => 
        fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r => r.json())
      )
      const results = await Promise.all(promises)
      const meals = results.map(r => r.meals?.[0]).filter(Boolean)
      setQuickPicks(meals)
    } catch (err) {
      console.error('Failed to fetch random meals:', err)
      setQuickPicks([])
    } finally {
      setQuickPicksLoading(false)
    }
  }

  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchRandomMeals()
  }, [])

  useEffect(() => {
    const q = debounced.trim()
    if (q.length < 2) { setSug(s => ({ ...s, items: [], open: false })); return }
    let active = true
    setSug({ open: true, loading: true, items: [] })
    searchGizi({ query: q, page: 1, pageSize: 5 })
      .then(js => { if (!active) return; setSug({ open: true, loading: false, items: js.data || [] }) })
      .catch(() => { if (!active) return; setSug({ open: true, loading: false, items: [] }) })
    return () => { active = false }
  }, [debounced])

  const onSubmit = (e) => {
    e.preventDefault()
    const q = term.trim()
    if (!q) return
    navigate(`/compare-gizi?query=${encodeURIComponent(q)}&page=1`)
  }

  const pickSuggestion = (text) => {
    navigate(`/compare-gizi?query=${encodeURIComponent(text)}&page=1`)
    setSug({ open: false, loading: false, items: [] })
  }

  const stats = [
    { icon: <Apple className="text-emerald-600 dark:text-emerald-400" size={22} />, value: '1000+', label: 'Makanan' },
    { icon: <BookOpen className="text-emerald-600 dark:text-emerald-400" size={22} />, value: '200+', label: 'Resep' },
    { icon: <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={22} />, value: '50k+', label: 'Pengguna' },
    { icon: <Flame className="text-emerald-600 dark:text-emerald-400" size={22} />, value: '95%', label: 'Kepuasan' },
  ]

  const features = [
    { title: 'Gizi Makanan', desc: 'Cari dan pelajari kandungan gizi ribuan makanan Indonesia', icon: Apple },
    { title: 'Resep Sehat', desc: 'Koleksi resep bergizi dengan informasi nutrisi lengkap', icon: BookOpen },
    { title: 'Bandingkan', desc: 'Bandingkan nilai gizi antar makanan dan resep', icon: LinkIcon },
    { title: 'Edukasi', desc: 'Artikel dan tips untuk hidup lebih sehat', icon: GraduationCap },
  ]

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-emerald-500/20 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-8 md:p-12 text-center shadow-sm">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">Nutrisi Sehat</span>
            <br />
            <span className="text-slate-900 dark:text-white">Dimulai dari Sini</span>
          </h1>
          {/* subtitle: gelapkan di light */}
          <p className="mt-3 text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
            Temukan informasi gizi lengkap, resep sehat, dan edukasi nutrisi untuk hidup yang lebih baik
          </p>

          {/* Search mock */}
          <form onSubmit={onSubmit} className="relative max-w-3xl mx-auto">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setSug(s => ({ ...s, open: s.items.length > 0 }))}
              className="w-full px-4 py-3 border border-black/10 dark:border-white/10 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="Cari makanan… (mis: ayam goreng)"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-2 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700">
              Cari
            </button>

            {sug.open && (
  <div className="absolute z-20 mt-2 w-full border border-black/10 dark:border-white/10 rounded bg-white dark:bg-slate-900 shadow-xl">
    {sug.loading && (
      <div className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">Memuat…</div>
    )}
    {!sug.loading && sug.items.length === 0 && (
      <div className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">Tidak ada saran</div>
    )}
    {!sug.loading && sug.items.length > 0 && (
      <ul className="max-h-72 overflow-auto">
        {sug.items.map(it => (
          <li key={it.fdcId}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickSuggestion(it.description)}
              className="w-full text-left px-3 py-2 hover:bg-emerald-500/10"
            >
              {/* hasil utama lebih tegas */}
              <div className="font-medium text-slate-800 dark:text-slate-100">
                {it.description}
              </div>
              {/* brand owner lebih gelap, bukan muted */}
              {it.brandOwner && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {it.brandOwner}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)}

          </form>

          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Populer: Nasi goreng • Ayam bakar • Gado-gado • Tempe goreng
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 p-6"
            >
              <div className="flex items-center gap-2">
                {s.icon}
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
              </div>
              <div className="text-sm mt-1 text-slate-700 dark:text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features – ganti permukaan jadi solid terang agar teks tidak “pucat” */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">Fitur Unggulan</h2>
          <p className="mt-2 text-slate-800 dark:text-slate-300">
            Semua yang Anda butuhkan untuk memahami dan mengelola nutrisi harian
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {features.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl ring-1 ring-emerald-600/15 bg-emerald-50 dark:bg-slate-900/70 p-5 shadow-sm"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 mb-3">
                <Icon size={18} />
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
              {/* deskripsi: naikin ke slate-800 */}
              <div className="text-sm mt-1 text-slate-800 dark:text-slate-300">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Picks (dari TheMealDB API) */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Picks</h3>
          <button 
            onClick={fetchRandomMeals}
            disabled={quickPicksLoading}
            className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <RefreshCw size={14} className={quickPicksLoading ? 'animate-spin' : ''}/> 
            {quickPicksLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {quickPicksLoading ? (
            // Skeleton loading
            Array(4).fill(null).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 animate-pulse"
              >
                <div className="h-36 bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : quickPicks.length > 0 ? (
            quickPicks.map((meal) => (
              <div
                key={meal.idMeal}
                className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/meal/${meal.idMeal}`)}
              >
                <div className="h-36 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img 
                    src={meal.strMealThumb} 
                    alt={meal.strMeal}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="font-semibold text-slate-900 dark:text-white line-clamp-1" title={meal.strMeal}>
                    {meal.strMeal}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    {meal.strCategory} • {meal.strArea}
                  </div>
                  <div className="mt-2 flex gap-2 text-[10px] flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-300/90 text-gray-900 dark:bg-emerald-500/20 dark:text-emerald-200 font-medium">
                      {meal.strCategory}
                    </span>
                    {meal.strTags && meal.strTags.split(',').slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-sky-300/90 text-gray-900 dark:bg-sky-500/20 dark:text-sky-200 font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback jika gagal load
            <div className="col-span-4 text-center py-8 text-slate-500">
              Gagal memuat data. <button onClick={fetchRandomMeals} className="text-emerald-600 underline">Coba lagi</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA – ganti gradient tipis menjadi permukaan solid terang */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl ring-1 ring-emerald-600/20 bg-emerald-50 dark:bg-slate-900/70 p-10 text-center">
          <div className="text-3xl">⚡</div>
          <h3 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Mulai Perjalanan Sehat Anda</h3>
          <p className="mt-2 text-slate-800 dark:text-slate-300 max-w-2xl mx-auto">
            Bergabung dengan orang yang telah mengubah pola makan mereka dengan I-MBG
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={()=>navigate('/artikel')}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Mulai Eksplorasi
            </button>
            <button
              onClick={()=>navigate('/resep')}
              className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
