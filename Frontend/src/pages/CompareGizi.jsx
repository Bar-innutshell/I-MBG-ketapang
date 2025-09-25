import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchGizi } from '../hooks/api';

export default function CompareGizi() {
  const [sp, setSp] = useSearchParams();
  const query = sp.get('query') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const pageSize = 10;

  const [state, setState] = useState({ loading: false, data: [], pagination: null, error: '' });
  const [compare, setCompare] = useState([]); // [{fdcId, description, ...from search}]
  const [mode, setMode] = useState('per100g'); // 'per100g' | 'perServing'

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    searchGizi({ query, page, pageSize })
      .then(json => active && setState({ loading: false, data: json.data || [], pagination: json.pagination || null, error: '' }))
      .catch(err => active && setState(s => ({ ...s, loading: false, error: err.message || 'Gagal memuat' })));
    return () => { active = false; };
  }, [query, page]);

  const addToCompare = (item) => {
    setCompare(prev => prev.some(x => x.fdcId === item.fdcId) ? prev : [...prev, item]);
  };
  const removeItem = (fdcId) => setCompare(prev => prev.filter(x => x.fdcId !== fdcId));
  const clearAll = () => setCompare([]);
  const goPage = (p) => {
    const next = Math.max(1, p);
    const nextSp = new URLSearchParams(sp);
    nextSp.set('page', String(next));
    setSp(nextSp, { replace: false });
  };

  const valueOf = (item, key) => {
    const src = mode === 'per100g' ? item.macrosPer100g : item.macrosPerServing;
    if (!src) return '-';
    const val = src[key];
    return val == null ? '-' : val;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Perbandingan Gizi</h1>
        <p className="text-sm text-muted-foreground">Kata kunci: “{query}”</p>
      </div>

      {/* Panel perbandingan di ATAS (tidak sticky) */}
      <section className="mb-6 border rounded-lg bg-card/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border-b">
          <div className="font-semibold">Bandingkan</div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Tampilkan:</div>
            <div className="flex rounded overflow-hidden border">
              <button
                onClick={() => setMode('per100g')}
                className={`px-3 py-1 ${mode==='per100g' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-500/10'}`}
              >
                per 100g
              </button>
              <button
                onClick={() => setMode('perServing')}
                className={`px-3 py-1 ${mode==='perServing' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-500/10'}`}
              >
                per serving
              </button>
            </div>
            <button onClick={clearAll} disabled={compare.length===0} className="px-3 py-1 rounded border hover:bg-rose-500/10 disabled:opacity-50">
              Bersihkan
            </button>
          </div>
        </div>

        {/* Tabel perbandingan */}
        {compare.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Tambahkan makanan dari hasil pencarian di bawah untuk membandingkan kandungan gizinya.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-base/60">
                <tr>
                  <th className="text-left p-3 w-44">Nutrisi</th>
                  {compare.map(it => (
                    <th key={it.fdcId} className="text-left p-3">
                      <div className="font-semibold truncate max-w-[240px]" title={it.description}>{it.description}</div>
                      {mode==='perServing' && it.servingInfo && (
                        <div className="text-xs text-muted-foreground">Serving: {it.servingInfo.grams} g</div>
                      )}
                      <button onClick={() => removeItem(it.fdcId)} className="mt-1 text-xs text-rose-500 hover:underline">Hapus</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Kalori (kcal)</td>
                  {compare.map(it => (<td key={it.fdcId} className="p-3">{valueOf(it, 'kcal')}</td>))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Protein (g)</td>
                  {compare.map(it => (<td key={it.fdcId} className="p-3">{valueOf(it, 'prot')}</td>))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Lemak (g)</td>
                  {compare.map(it => (<td key={it.fdcId} className="p-3">{valueOf(it, 'fat')}</td>))}
                </tr>
                <tr>
                  <td className="p-3 font-medium">Karbo (g)</td>
                  {compare.map(it => (<td key={it.fdcId} className="p-3">{valueOf(it, 'carb')}</td>))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Hasil Pencarian */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Hasil pencarian</h2>
        {state.loading && <p>Memuat...</p>}
        {state.error && <p className="text-rose-500">{state.error}</p>}
        {!state.loading && !state.error && (
          <>
            {state.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada hasil untuk “{query}”.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.data.map(item => (
                  <li key={item.fdcId} className="border rounded-lg p-4 bg-card/50">
                    <div className="font-semibold">{item.description}</div>
                    {item.brandOwner && <div className="text-xs text-muted-foreground">{item.brandOwner}</div>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 border rounded">Kalori/100g: {item.macrosPer100g?.kcal ?? '-'}</span>
                      <span className="px-2 py-1 border rounded">Protein/100g: {item.macrosPer100g?.prot ?? '-'}</span>
                      <span className="px-2 py-1 border rounded">Lemak/100g: {item.macrosPer100g?.fat ?? '-'}</span>
                      <span className="px-2 py-1 border rounded">Karbo/100g: {item.macrosPer100g?.carb ?? '-'}</span>
                    </div>
                    <button onClick={() => addToCompare(item)} className="mt-3 w-full px-3 py-2 rounded border hover:bg-emerald-500/10">
                      Tambah ke bandingkan
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {state.pagination && state.pagination.totalPages > 1 && (
              <div className="flex items-center gap-3 justify-center mt-5">
                <button className="px-3 py-1 border rounded" onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
                <span className="text-sm">Hal {page} / {state.pagination.totalPages}</span>
                <button className="px-3 py-1 border rounded" onClick={() => goPage(page + 1)} disabled={page >= state.pagination.totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
