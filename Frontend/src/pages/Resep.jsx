import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchResep } from '../hooks/api';

export default function Resep() {
  const [sp, setSp] = useSearchParams();
  const search = sp.get('search') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const limit = 10;

  const [state, setState] = useState({ loading: false, data: [], pagination: null, error: '' });

  // MealDB states
  const [mealQuery, setMealQuery] = useState('');
  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState('');
  const [mealResults, setMealResults] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    fetchResep({ search, page, limit })
      .then(json => active && setState({
        loading: false,
        data: json.data || [],
        pagination: json.pagination || null,
        error: ''
      }))
      .catch(err => active && setState(s => ({ ...s, loading: false, error: err.message })));
    return () => { active = false; };
  }, [search, page]);

  const goPage = (next) => {
    const nextPage = Math.max(1, next);
    const nextParams = new URLSearchParams(sp);
    nextParams.set('page', String(nextPage));
    setSp(nextParams);
  };

  const updateSearchParam = (val) => {
    const nextParams = new URLSearchParams(sp);
    if (val) nextParams.set('search', val); else nextParams.delete('search');
    nextParams.set('page', '1');
    setSp(nextParams);
  };

  async function doMealSearch(e) {
    e.preventDefault();
    setMealError('');
    setSelectedMeal(null);
    if (!mealQuery.trim()) {
      setMealResults([]);
      return;
    }
    setMealLoading(true);
    try {
      const resp = await fetch(`/resep/mealdb/search.php?s=${encodeURIComponent(mealQuery.trim())}`);
      const json = await resp.json();
      setMealResults(json.meals || []);
    } catch (err) {
      setMealError(err.message);
    } finally {
      setMealLoading(false);
    }
  }

  async function loadMealDetail(id) {
    setLookupLoading(true);
    setMealError('');
    try {
      const resp = await fetch(`/resep/mealdb/lookup.php?i=${encodeURIComponent(id)}`);
      const json = await resp.json();
      setSelectedMeal(json.meals && json.meals.length ? json.meals[0] : null);
    } catch (e) {
      setMealError(e.message);
    } finally {
      setLookupLoading(false);
    }
  }

  function renderMealIngredients(m) {
    const rows = [];
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`];
      const meas = m[`strMeasure${i}`];
      if (ing && ing.trim()) {
        rows.push(
          <li key={i}>
            {meas && meas.trim() ? <strong>{meas}</strong> : null} {ing}
          </li>
        );
      }
    }
    return rows;
  }

  // ===== UI tokens (glass look, aman light/dark) =====
  const card =
    "rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
    "shadow-md shadow-black/10 dark:shadow-black/30 backdrop-blur-sm overflow-hidden";
  const cardHeader =
    "px-4 py-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5";
  const input =
    "flex-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 " +
    "px-3 py-2.5 outline-none transition shadow-inner shadow-black/10 dark:shadow-black/20 " +
    "focus:ring-2 focus:ring-emerald-500 backdrop-blur-sm";
  const inputSky =
    input.replace("focus:ring-emerald-500", "focus:ring-sky-500");
  const btn = "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimaryGreen = `${btn} text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-900/20`;
  const btnPrimarySky = `${btn} text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-md shadow-sky-900/20`;
  const btnGhost = `${btn} border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">

      {/* Resep Lokal */}
      <section className="mb-8">
        <div className={card}>
          <div className={cardHeader}>
            <h2 className="text-base font-semibold text-foreground">Resep Lokal</h2>
          </div>

          <div className="p-4 md:p-6">
            <form
              onSubmit={(e) => { e.preventDefault(); updateSearchParam(e.target.elements.q.value); }}
              className="flex gap-2 mb-4"
            >
              <input
                name="q"
                placeholder="Cari judul lokal..."
                defaultValue={search}
                className={input}
              />
              <button type="submit" className={btnPrimaryGreen}>Cari</button>
              {search && (
                <button
                  type="button"
                  onClick={() => updateSearchParam('')}
                  className={btnGhost}
                >
                  Reset
                </button>
              )}
            </form>

            {state.loading && <p className="text-sm text-muted-foreground">Memuat…</p>}
            {state.error && <p className="text-sm text-rose-500">{state.error}</p>}

            {!state.loading && !state.error && (
              <>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {state.data.map(r => (
                    <li
                      key={r._id}
                      className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 backdrop-blur-sm hover:bg-black/10 dark:hover:bg-white/10 transition"
                    >
                      {r.judul}
                    </li>
                  ))}
                </ul>

                {state.pagination && state.pagination.total > limit && (
                  <div className="flex items-center gap-3 mt-4 text-sm">
                    <button onClick={() => goPage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-50">Prev</button>
                    <span>Hal {page} / {state.pagination.totalPages}</span>
                    <button onClick={() => goPage(page + 1)} disabled={page >= state.pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-50">Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* MealDB */}
      <section>
        <div className={card}>
          <div className={cardHeader}>
            <h2 className="text-base font-semibold text-foreground">MealDB (Live)</h2>
          </div>

          <div className="p-4 md:p-6">
            <form onSubmit={doMealSearch} className="flex gap-2 mb-4">
              <input
                placeholder="Cari MealDB (contoh: Chicken)"
                value={mealQuery}
                onChange={e => setMealQuery(e.target.value)}
                className={inputSky}
              />
              <button type="submit" disabled={mealLoading} className={btnPrimarySky}>Cari</button>
              {mealQuery && (
                <button
                  type="button"
                  onClick={() => { setMealQuery(''); setMealResults([]); setSelectedMeal(null); }}
                  className={btnGhost}
                >
                  Clear
                </button>
              )}
            </form>

            {mealError && <p className="text-sm text-rose-500">{mealError}</p>}
            {mealLoading && <p className="text-sm text-muted-foreground">Memuat data MealDB…</p>}

            {!mealLoading && !selectedMeal && mealResults.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mealResults.map(m => (
                  <li
                    key={m.idMeal}
                    className="cursor-pointer rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 backdrop-blur-sm hover:shadow-md hover:bg-black/10 dark:hover:bg-white/10 transition"
                    onClick={() => loadMealDetail(m.idMeal)}
                  >
                    <strong>{m.strMeal}</strong>
                    {m.strCategory && <span className="ml-2 text-xs text-muted-foreground">({m.strCategory})</span>}
                  </li>
                ))}
              </ul>
            )}

            {lookupLoading && <p className="text-sm text-muted-foreground">Mengambil detail…</p>}

            {selectedMeal && !lookupLoading && (
              <div className="mt-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 shadow-md backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  {selectedMeal.strMealThumb && (
                    <img
                      src={selectedMeal.strMealThumb}
                      alt={selectedMeal.strMeal}
                      className="w-48 h-48 rounded-xl object-cover shadow-sm"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedMeal.strMeal}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Kategori:</strong> {selectedMeal.strCategory || '-'} | <strong>Area:</strong> {selectedMeal.strArea || '-'}
                    </p>
                    {selectedMeal.strTags && (
                      <p className="text-xs text-muted-foreground mt-1">Tags: {selectedMeal.strTags}</p>
                    )}
                    {selectedMeal.strYoutube && (
                      <p className="mt-2">
                        <a href={selectedMeal.strYoutube} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">YouTube</a>
                      </p>
                    )}
                    <button onClick={() => setSelectedMeal(null)} className="mt-3 rounded-lg px-3 py-1.5 text-sm border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                      Tutup Detail
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6">
                  <div>
                    <h4 className="font-semibold">Bahan</h4>
                    <ul className="list-disc pl-5 text-sm mt-1 space-y-0.5">
                      {renderMealIngredients(selectedMeal)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Instruksi</h4>
                    <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedMeal.strInstructions || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!mealLoading && mealResults.length === 0 && mealQuery && !mealError && (
              <p className="text-sm text-muted-foreground">Tidak ada hasil.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
