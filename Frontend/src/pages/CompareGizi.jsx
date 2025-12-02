import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { searchGizi } from '../hooks/api';
import { addItemToday } from '../lib/intakeStore';
import { toast } from '../lib/toast';
import { getItems as getCompareItems, addItem as addCompareItem, removeItem as removeCompareItem, subscribe as subCompare } from '../lib/compareStore'

export default function CompareGizi() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const [term, setTerm] = useState(sp.get('query') || '');
  const query = sp.get('query') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const pageSize = 10;

  const [state, setState] = useState({ loading: false, data: [], pagination: null, error: '' });
  const [compare, setCompare] = useState(getCompareItems());
  const [mode, setMode] = useState('per100g'); // 'per100g' | 'perServing'
  const addToDaily = (item) => {
  const ok = addItemToday({ fdcId: item.fdcId, description: item.description, grams: 100 });
  if (ok) {
    toast.success('Ditambahkan ke Asupan Harian (100g).');
  } else {
    toast.info('Item sudah ada di Asupan Harian.');
  }
};

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    searchGizi({ query, page, pageSize })
      .then(json => active && setState({ loading: false, data: json.data || [], pagination: json.pagination || null, error: '' }))
      .catch(err => active && setState(s => ({ ...s, loading: false, error: err.message || 'Gagal memuat' })));
    return () => { active = false; };
  }, [query, page]);

  useEffect(() => {
    const unsub = subCompare((list) => setCompare(list));
    setCompare(getCompareItems());
    return unsub;
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate(`/compare-gizi?query=${encodeURIComponent(q)}&page=1`);
  };

  const addToCompare = (item) => {
    // simpan juga per100g jika ada agar tabel langsung terisi
    addCompareItem({
      fdcId: item.fdcId,
      description: item.description,
      grams: 100,
      macrosPer100g: item.macrosPer100g ?? (item.macros ? {
        kcal: item.macros.energyKcal ?? null,
        prot: item.macros.proteinG ?? null,
        fat:  item.macros.fatG ?? null,
        carb: item.macros.carbsG ?? null,
      } : null),
      servingInfo: item.servingInfo ?? null,
    });
  };
  const removeItem = (fdcId) => removeCompareItem(fdcId);
  const clearAll = () => setCompare([]);
  const goPage = (p) => {
    const next = Math.max(1, p);
    const nextSp = new URLSearchParams(sp);
    nextSp.set('page', String(next));
    setSp(nextSp, { replace: false });
  };

  // helper nilai per 100g / per serving dengan fallback
  const pickPer100g = (it) => it.macrosPer100g || (it.macros ? {
    kcal: it.macros.energyKcal ?? null,
    prot: it.macros.proteinG ?? null,
    fat:  it.macros.fatG ?? null,
    carb: it.macros.carbsG ?? null,
  } : null);
  const pickPerServing = (it) => it.macrosPerServing || null;

  const headers = useMemo(() => compare.map(c => ({
    id: c.fdcId,
    title: c.description,
    servingText: c.servingInfo ? `Serving: ${c.servingInfo.grams} g` : null
  })), [compare]);

  const rowVals = (key) => compare.map(it => {
    const src = mode === 'per100g' ? pickPer100g(it) : pickPerServing(it);
    const v = src?.[key];
    return (v == null || Number.isNaN(v)) ? '-' : v;
  });

  // valueOf disesuaikan untuk fallback ke item di store
  const valueOf = (item, key) => {
    const src = mode === 'per100g'
      ? (item.macrosPer100g ?? null)
      : (item.macrosPerServing ?? null);
    if (!src) return '-';
    const v = src[key];
    return v == null ? '-' : v;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search bar di atas */}
      <form onSubmit={submitSearch} className="mb-5">
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
            placeholder="Cari makanan lain... mis: nasi putih"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">Cari</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Kata kunci saat ini: “{query}”</p>
      </form>

      {/* Panel perbandingan (atas, tidak sticky) */}
      <section className="mb-6 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="font-semibold">Bandingkan kandungan gizi</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground">Tampilkan:</div>
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <button onClick={() => setMode('per100g')} className={`px-3 py-1.5 text-sm transition-all ${mode==='per100g' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>per 100g</button>
              <button onClick={() => setMode('perServing')} className={`px-3 py-1.5 text-sm transition-all ${mode==='perServing' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>per serving</button>
            </div>
            <button onClick={clearAll} disabled={compare.length===0} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-500/30 disabled:opacity-50 transition-all">Bersihkan</button>
          </div>
        </div>

        {/* Tabel perbandingan horizontal (lebih tenang, sesuai tema) */}
        {compare.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Tambahkan makanan dari hasil pencarian di bawah untuk membandingkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="text-left p-3 w-48">Nutrisi</th>
                  {headers.map(h => (
                    <th key={h.id} className="text-left p-3">
                      <div className="font-semibold truncate max-w-[280px]" title={h.title}>{h.title}</div>
                      {mode==='perServing' && h.servingText && <div className="text-xs text-muted-foreground">{h.servingText}</div>}
                      <button onClick={() => removeItem(h.id)} className="mt-1 text-xs text-rose-500 hover:underline">Hapus</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Kalori (kcal)</td>
                  {rowVals('kcal').map((v, i) => <td key={headers[i].id} className="p-3">{v}</td>)}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Protein (g)</td>
                  {rowVals('prot').map((v, i) => <td key={headers[i].id} className="p-3">{v}</td>)}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Lemak (g)</td>
                  {rowVals('fat').map((v, i) => <td key={headers[i].id} className="p-3">{v}</td>)}
                </tr>
                <tr>
                  <td className="p-3 font-medium">Karbo (g)</td>
                  {rowVals('carb').map((v, i) => <td key={headers[i].id} className="p-3">{v}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Hasil Pencarian: list sederhana, tidak kotak-kotak berat */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Hasil pencarian</h2>
        {state.loading && <p>Memuat...</p>}
        {state.error && <p className="text-rose-500">{state.error}</p>}

        {!state.loading && !state.error && (
          <>
            {state.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada hasil untuk “{query}”.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur overflow-hidden">
                {state.data.map(item => (
                  <li key={item.fdcId} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">
                          <Link to={`/gizi/${item.fdcId}`} className="hover:underline">{item.description}</Link>
                        </div>
                        {item.brandOwner && <div className="text-xs text-muted-foreground">{item.brandOwner}</div>}
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Kalori/100g: {item.macrosPer100g?.kcal ?? item.macros?.energyKcal ?? '-'}</span>
                          <span>• Protein/100g: {item.macrosPer100g?.prot ?? item.macros?.proteinG ?? '-'}</span>
                          <span>• Lemak/100g: {item.macrosPer100g?.fat ?? item.macros?.fatG ?? '-'}</span>
                          <span>• Karbo/100g: {item.macrosPer100g?.carb ?? item.macros?.carbsG ?? '-'}</span>
                        </div>
                      </div>
                      <button onClick={() => addToCompare(item)} className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all">
                        Tambah ke bandingkan
                      </button>
                      <button onClick={() => addToDaily(item)} className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all">
                        Tambah ke asupan
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {state.pagination && state.pagination.totalPages > 1 && (
              <div className="flex items-center gap-3 justify-center mt-5">
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all" onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
                <span className="text-sm text-muted-foreground">Hal {page} / {state.pagination.totalPages}</span>
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-all" onClick={() => goPage(page + 1)} disabled={page >= state.pagination.totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
