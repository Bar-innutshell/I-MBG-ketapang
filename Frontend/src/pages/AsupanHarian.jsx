import React, { useEffect, useMemo, useState } from 'react';
import { searchGizi, estimateNutrition } from '../hooks/api';
import { getTodayItems, addItemToday, updateItemGrams, removeItemToday, clearToday, subscribe } from '../lib/intakeStore';
import { toast } from '../lib/toast';

export default function AsupanHarian() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState({ loading: false, data: [], error: '' });
  const [items, setItems] = useState(getTodayItems());
  const [lastCalc, setLastCalc] = useState(null);
  const [targets, setTargets] = useState({ kcal: 2000, prot: 60 });

  useEffect(() => subscribe(() => setItems(getTodayItems())), []);
  useEffect(() => { if (items.length === 0) setLastCalc(null); }, [items]);

  const doSearch = async (e) => {
    e?.preventDefault();
    const q = term.trim(); if (!q) return;
    setResults({ loading: true, data: [], error: '' });
    try {
      const js = await searchGizi({ query: q, page: 1, pageSize: 8 });
      setResults({ loading: false, data: js.data || [], error: '' });
    } catch (err) {
      setResults({ loading: false, data: [], error: err.message || 'Gagal cari' });
    }
  };

  const addItem = (it) => {
    const ok = addItemToday({ fdcId: it.fdcId, description: it.description, grams: 100 });
    if (ok) toast.success('Ditambahkan ke Asupan Harian (100g).');
    else toast.info('Item sudah ada.');
  };
  const changeGrams = (id, g) => updateItemGrams(id, g);
  const removeItem = (id) => { removeItemToday(id); toast.info('Item dihapus.'); }
  const clearAll = () => { clearToday(); toast.info('Asupan hari ini dibersihkan.'); }

  const hitung = async () => {
    try {
      const body = getTodayItems().map(x => ({ fdcId: x.fdcId, grams: Number(x.grams) || 0 }));
      const r = await estimateNutrition(body);
      setLastCalc(r);
      toast.success('Perhitungan asupan berhasil.');
    } catch (e) {
      setLastCalc(null);
      toast.error('Gagal menghitung asupan.');
    }
  };

  const totals = lastCalc?.totals || null;
  const mapBreakdown = useMemo(() => {
    const m = {}; (lastCalc?.breakdown || []).forEach(b => m[b.fdcId] = b); return m;
  }, [lastCalc]);

  const diff = totals ? {
    kcal: +(targets.kcal - totals.kcal).toFixed(2),
    prot: +(targets.prot - totals.prot).toFixed(2),
  } : null;

  // ===== UI tokens: glass look (aman light & dark) =====
  const card =
    "rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
    "shadow-md shadow-black/10 dark:shadow-black/30 backdrop-blur-sm transition-colors";
  const input =
    "w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
    "px-3 py-2.5 outline-none transition shadow-inner shadow-black/10 dark:shadow-black/20 " +
    "focus:ring-2 focus:ring-emerald-500 backdrop-blur-sm";
  const label = "text-sm font-medium text-muted-foreground mb-1.5";
  const btn = "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btn} text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-900/20`;
  const btnGhost = `${btn} border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* HEADER */}
      <section className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="mr-2">🥗</span> Asupan Harian
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambahkan makanan yang dikonsumsi hari ini, lalu hitung total dan bandingkan dengan target.
            </p>
          </div>

          {/* ringkasan kecil */}
          <div className={`${card} hidden md:block px-4 py-3`}>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="text-muted-foreground">Total Kalori</div>
                <div className="font-semibold">{totals?.kcal ?? 0} kcal</div>
              </div>
              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
              <div className="text-sm">
                <div className="text-muted-foreground">Total Protein</div>
                <div className="font-semibold">{totals?.prot ?? 0} g</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARGETS */}
      <section className="mb-6">
        <div className={`${card} p-4 md:p-6`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className={label}>Target Kalori (kcal)</div>
              <input
                type="number"
                className={input}
                value={targets.kcal}
                onChange={e => setTargets(t => ({ ...t, kcal: Number(e.target.value || 0) }))}
                placeholder="Contoh: 2000"
              />
            </div>
            <div>
              <div className={label}>Target Protein (g)</div>
              <input
                type="number"
                className={input}
                value={targets.prot}
                onChange={e => setTargets(t => ({ ...t, prot: Number(e.target.value || 0) }))}
                placeholder="Contoh: 60"
              />
            </div>

            {totals && (
              <>
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <div className="text-xs text-muted-foreground">Total hari ini</div>
                  <div className="font-semibold">{totals.kcal} kcal · {totals.prot} g protein</div>
                </div>
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <div className="text-xs text-muted-foreground">Selisih</div>
                  <div className="font-semibold">
                    {diff.kcal} kcal · {diff.prot} g protein {diff.kcal >= 0 && diff.prot >= 0 ? '(kurang)' : '(lebih)'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="mb-6">
        <form onSubmit={doSearch} className="mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                  <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                className={`${input} pl-9`}
                placeholder="Cari makanan... (mis: ayam goreng)"
                value={term}
                onChange={e => setTerm(e.target.value)}
              />
            </div>
            <button className={btnPrimary} type="submit">Cari</button>
          </div>
        </form>

        {/* hasil pencarian */}
        {results.loading && (
          <div className={`${card} p-4 text-sm`}>Mencari...</div>
        )}
        {results.error && (
          <div className="text-sm text-rose-500">{results.error}</div>
        )}
        {results.data.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className="px-4 py-3 font-semibold">Hasil Pencarian</div>
            <div className="border-t border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="p-3 font-medium">Deskripsi</th>
                    <th className="p-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {results.data.map((it) => (
                    <tr key={it.fdcId} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="p-3">
                        <div className="font-medium">{it.description}</div>
                        {it.brandOwner && (
                          <div className="text-xs text-muted-foreground">{it.brandOwner}</div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button className={btnPrimary} onClick={() => addItem(it)}>
                          Tambah (100g)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ASUPAN HARI INI */}
      <section className="mb-6">
        <div className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <h2 className="text-base font-semibold">Asupan hari ini</h2>
            <div className="flex items-center gap-2">
              <button onClick={clearAll} disabled={items.length===0} className={btnGhost}>Bersihkan</button>
              <button onClick={hitung} disabled={items.length===0} className={btnPrimary}>Hitung</button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center border-t border-black/10 dark:border-white/10">
              <div className="rounded-full border border-dashed border-black/20 dark:border-white/20 p-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-sm text-muted-foreground">Belum ada item ditambahkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr>
                    <th className="p-3 text-left font-medium">Makanan</th>
                    <th className="p-3 text-left font-medium">Gram</th>
                    <th className="p-3 text-right font-medium">Kalori</th>
                    <th className="p-3 text-right font-medium">Protein</th>
                    <th className="p-3 text-right font-medium">Lemak</th>
                    <th className="p-3 text-right font-medium">Karbo</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(x => {
                    const b = mapBreakdown[x.fdcId];
                    return (
                      <tr key={x.fdcId} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="p-3">
                          <div className="truncate max-w-[520px]" title={x.description}>{x.description}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              className="w-28 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-1 outline-none shadow-inner focus:ring-2 focus:ring-emerald-500 backdrop-blur-sm"
                              value={x.grams}
                              onChange={e => changeGrams(x.fdcId, e.target.value)}
                            />
                            <span className="text-muted-foreground">g</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">{b ? b.macros.kcal : '—'}</td>
                        <td className="p-3 text-right">{b ? b.macros.prot : '—'}</td>
                        <td className="p-3 text-right">{b ? b.macros.fat  : '—'}</td>
                        <td className="p-3 text-right">{b ? b.macros.carb : '—'}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => removeItem(x.fdcId)} className="rounded-lg px-2 py-1 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {totals && (
                  <tfoot>
                    <tr className="bg-emerald-500/10 dark:bg-emerald-400/10 font-semibold">
                      <td className="p-3">Total</td>
                      <td className="p-3"></td>
                      <td className="p-3 text-right">{totals.kcal}</td>
                      <td className="p-3 text-right">{totals.prot}</td>
                      <td className="p-3 text-right">{totals.fat}</td>
                      <td className="p-3 text-right">{totals.carb}</td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
