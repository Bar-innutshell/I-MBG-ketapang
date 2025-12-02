import React, { useEffect, useMemo, useState } from 'react';
import { searchGizi, estimateNutrition } from '../hooks/api';
import { getTodayItems, addItemToday, updateItemGrams, removeItemToday, clearToday, subscribe } from '../lib/intakeStore';
import { toast } from '../lib/toast';
import { Search, Trash2, Calculator, Utensils } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-6">
        {/* HEADER */}
        <section className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Utensils className="text-emerald-500" size={28} />
                Asupan Harian
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tambahkan makanan yang dikonsumsi hari ini, lalu hitung total dan bandingkan dengan target.
              </p>
            </div>

            {/* ringkasan kecil */}
            <div className="card-base hidden md:block px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="text-muted-foreground">Total Kalori</div>
                  <div className="font-semibold text-foreground">{totals?.kcal ?? 0} kcal</div>
                </div>
                <div className="h-8 w-px bg-muted" />
                <div className="text-sm">
                  <div className="text-muted-foreground">Total Protein</div>
                  <div className="font-semibold text-foreground">{totals?.prot ?? 0} g</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TARGETS */}
        <section className="mb-6">
          <div className="section-card">
            <div className="section-header">Target Harian</div>
            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target Kalori (kcal)</label>
                  <input
                    type="number"
                    className="input-base"
                    value={targets.kcal}
                    onChange={e => setTargets(t => ({ ...t, kcal: Number(e.target.value || 0) }))}
                    placeholder="Contoh: 2000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target Protein (g)</label>
                  <input
                    type="number"
                    className="input-base"
                    value={targets.prot}
                    onChange={e => setTargets(t => ({ ...t, prot: Number(e.target.value || 0) }))}
                    placeholder="Contoh: 60"
                  />
                </div>

                {totals && (
                  <>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">Total hari ini</div>
                      <div className="font-semibold text-foreground">{totals.kcal} kcal · {totals.prot} g protein</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Selisih dari target</div>
                      <div className="font-semibold text-foreground">
                        {diff.kcal >= 0 ? `−${diff.kcal}` : `+${Math.abs(diff.kcal)}`} kcal · {diff.prot >= 0 ? `−${diff.prot}` : `+${Math.abs(diff.prot)}`} g protein
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-6">
          <form onSubmit={doSearch} className="mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search size={18} />
                </span>
                <input
                  className="input-base pl-10"
                  placeholder="Cari makanan... (mis: ayam goreng)"
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" type="submit">Cari</button>
            </div>
          </form>

          {/* hasil pencarian */}
          {results.loading && (
            <div className="card-base p-4 text-sm text-muted-foreground">Mencari...</div>
          )}
          {results.error && (
            <div className="text-sm text-red-500 dark:text-red-400">{results.error}</div>
          )}
          {results.data.length > 0 && (
            <div className="section-card">
              <div className="section-header">Hasil Pencarian</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="p-3 font-medium text-foreground">Deskripsi</th>
                      <th className="p-3 font-medium text-foreground text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {results.data.map((it) => (
                      <tr key={it.fdcId} className="hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{it.description}</div>
                          {it.brandOwner && (
                            <div className="text-xs text-muted-foreground">{it.brandOwner}</div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button className="btn-primary text-xs" onClick={() => addItem(it)}>
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
          <div className="section-card">
            <div className="section-header flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Asupan hari ini</h2>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} disabled={items.length===0} className="btn-ghost text-sm">
                  <Trash2 size={14} className="mr-1" />
                  Bersihkan
                </button>
                <button onClick={hitung} disabled={items.length===0} className="btn-primary text-sm">
                  <Calculator size={14} className="mr-1" />
                  Hitung
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <div className="rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 p-4">
                  <span className="text-2xl">🍽️</span>
                </div>
                <p className="text-sm text-muted-foreground">Belum ada item ditambahkan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-medium text-foreground">Makanan</th>
                      <th className="p-3 text-left font-medium text-foreground">Gram</th>
                      <th className="p-3 text-right font-medium text-foreground">Kalori</th>
                      <th className="p-3 text-right font-medium text-foreground">Protein</th>
                      <th className="p-3 text-right font-medium text-foreground">Lemak</th>
                      <th className="p-3 text-right font-medium text-foreground">Karbo</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(x => {
                      const b = mapBreakdown[x.fdcId];
                      return (
                        <tr key={x.fdcId} className="border-b border-slate-200 dark:border-slate-700 hover:bg-muted/50">
                          <td className="p-3">
                            <div className="truncate max-w-[520px] text-foreground" title={x.description}>{x.description}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                className="w-20 rounded-lg bg-muted border border-default px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
                                value={x.grams}
                                onChange={e => changeGrams(x.fdcId, e.target.value)}
                              />
                              <span className="text-muted-foreground">g</span>
                            </div>
                          </td>
                          <td className="p-3 text-right text-foreground">{b ? b.macros.kcal : <span className="text-muted-foreground text-xs">tekan hitung</span>}</td>
                          <td className="p-3 text-right text-foreground">{b ? b.macros.prot : <span className="text-muted-foreground text-xs">—</span>}</td>
                          <td className="p-3 text-right text-foreground">{b ? b.macros.fat  : <span className="text-muted-foreground text-xs">—</span>}</td>
                          <td className="p-3 text-right text-foreground">{b ? b.macros.carb : <span className="text-muted-foreground text-xs">—</span>}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => removeItem(x.fdcId)} className="btn-ghost text-xs px-2 py-1">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {totals && (
                    <tfoot>
                      <tr className="bg-emerald-100 dark:bg-emerald-500/20 font-semibold">
                        <td className="p-3 text-foreground">Total</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right text-foreground">{totals.kcal}</td>
                        <td className="p-3 text-right text-foreground">{totals.prot}</td>
                        <td className="p-3 text-right text-foreground">{totals.fat}</td>
                        <td className="p-3 text-right text-foreground">{totals.carb}</td>
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
    </div>
  );
}
