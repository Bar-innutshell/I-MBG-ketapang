import React, { useEffect, useMemo, useState } from 'react';
import { searchGizi, estimateNutrition } from '../hooks/api';
import { getTodayItems, addItemToday, updateItemGrams, removeItemToday, clearToday, subscribe } from '../lib/intakeStore';
import { toast } from '../lib/toast'

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
    if (!ok) alert('Item sudah ada.');
  };
  const changeGrams = (id, g) => updateItemGrams(id, g);
  const removeItem = (id) => { removeItemToday(id); toast.info('Item dihapus'); }
  const clearAll = () => { clearToday(); toast.info('Asupan hari ini dibersihkan'); }

  const hitung = async () => {
    try {
      const body = getTodayItems().map(x => ({ fdcId: x.fdcId, grams: Number(x.grams) || 0 }));
      const r = await estimateNutrition(body);
      setLastCalc(r);
    } catch (e) {
      setLastCalc(null);
      alert(e.message || 'Gagal menghitung');
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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Asupan Harian</h1>
      <p className="text-sm text-muted-foreground mb-4">Tambahkan makanan yang dikonsumsi hari ini, lalu hitung total dan bandingkan dengan target.</p>

      {/* Target */}
      <section className="mb-6 border rounded-lg bg-card/50 p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Target Kalori (kcal)</div>
            <input type="number" className="w-full px-3 py-2 border rounded bg-transparent"
              value={targets.kcal} onChange={e => setTargets(t => ({ ...t, kcal: Number(e.target.value || 0) }))} />
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Target Protein (g)</div>
            <input type="number" className="w-full px-3 py-2 border rounded bg-transparent"
              value={targets.prot} onChange={e => setTargets(t => ({ ...t, prot: Number(e.target.value || 0) }))} />
          </div>
          {totals && (
            <>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Total hari ini</div>
                <div className="font-semibold">{totals.kcal} kcal · {totals.prot} g protein</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Selisih</div>
                <div className="font-semibold">
                  {diff.kcal} kcal · {diff.prot} g protein {diff.kcal >= 0 && diff.prot >= 0 ? '(kurang)' : '(lebih)'}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Cari makanan */}
      <section className="mb-6">
        <form onSubmit={doSearch} className="mb-3">
          <div className="flex gap-2">
            <input className="flex-1 px-3 py-2 border rounded bg-transparent" placeholder="Cari makanan... (mis: ayam goreng)"
              value={term} onChange={e => setTerm(e.target.value)} />
            <button className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Cari</button>
          </div>
        </form>

        {results.loading && <p>Memuat...</p>}
        {results.error && <p className="text-rose-500">{results.error}</p>}
        {results.data.length > 0 && !results.loading && (
          <ul className="divide-y rounded-lg border bg-card/50">
            {results.data.map(it => (
              <li key={it.fdcId} className="p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" title={it.description}>{it.description}</div>
                  <div className="text-xs text-muted-foreground">
                    Kalori/100g: {it.macrosPer100g?.kcal ?? it.macros?.energyKcal ?? '-'} · Protein/100g: {it.macrosPer100g?.prot ?? it.macros?.proteinG ?? '-'}
                  </div>
                </div>
                <button onClick={() => addItem(it)} className="shrink-0 px-3 py-1 rounded border hover:bg-emerald-500/10">Tambah</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Daftar asupan hari ini */}
      <section className="border rounded-lg bg-card/50">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold">Asupan hari ini</div>
          <div className="flex gap-2">
            <button onClick={clearAll} disabled={items.length===0} className="px-3 py-1 rounded border hover:bg-rose-500/10 disabled:opacity-50">Bersihkan</button>
            <button onClick={hitung} disabled={items.length===0} className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Hitung</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Belum ada item ditambahkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-base/60">
                <tr>
                  <th className="text-left p-3">Makanan</th>
                  <th className="text-left p-3 w-40">Gram</th>
                  <th className="text-right p-3">Kalori</th>
                  <th className="text-right p-3">Protein</th>
                  <th className="text-right p-3">Lemak</th>
                  <th className="text-right p-3">Karbo</th>
                  <th className="text-right p-3 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(x => {
                  const b = mapBreakdown[x.fdcId];
                  return (
                    <tr key={x.fdcId} className="border-b">
                      <td className="p-3"><div className="truncate max-w-[520px]" title={x.description}>{x.description}</div></td>
                      <td className="p-3">
                        <input type="number" min="0" className="w-28 px-2 py-1 border rounded bg-transparent"
                          value={x.grams} onChange={e => changeGrams(x.fdcId, e.target.value)} /> g
                      </td>
                      <td className="p-3 text-right">{b ? b.macros.kcal : '—'}</td>
                      <td className="p-3 text-right">{b ? b.macros.prot : '—'}</td>
                      <td className="p-3 text-right">{b ? b.macros.fat  : '—'}</td>
                      <td className="p-3 text-right">{b ? b.macros.carb : '—'}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeItem(x.fdcId)} className="text-rose-500 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {totals && (
                <tfoot>
                  <tr className="bg-emerald-500/10 font-semibold">
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
      </section>
    </div>
  );
}