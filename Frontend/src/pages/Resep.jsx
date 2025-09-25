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

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h2>Resep Lokal</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); updateSearchParam(e.target.elements.q.value); }}
          style={{ marginBottom: 12, display: 'flex', gap: 8 }}
        >
          <input
            name="q"
            placeholder="Cari judul lokal..."
            defaultValue={search}
            style={{ padding: 6, flex: 1 }}
          />
          <button type="submit">Cari</button>
          {search && <button type="button" onClick={() => updateSearchParam('')}>Reset</button>}
        </form>
        {state.loading && <p>Memuat...</p>}
        {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        {!state.loading && !state.error && (
          <>
            <ul>
              {state.data.map(r => (
                <li key={r._id}>{r.judul}</li>
              ))}
            </ul>
            {state.pagination && state.pagination.total > limit && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
                <span>Hal {page} / {state.pagination.totalPages}</span>
                <button onClick={() => goPage(page + 1)} disabled={page >= state.pagination.totalPages}>Next</button>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <h2>MealDB (Live)</h2>
        <form onSubmit={doMealSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Cari MealDB (contoh: Chicken)"
            value={mealQuery}
            onChange={e => setMealQuery(e.target.value)}
            style={{ flex: 1, padding: 6 }}
          />
          <button type="submit" disabled={mealLoading}>Cari</button>
          {mealQuery && <button type="button" onClick={() => { setMealQuery(''); setMealResults([]); setSelectedMeal(null); }}>Clear</button>}
        </form>
        {mealError && <p style={{ color: 'red' }}>{mealError}</p>}
        {mealLoading && <p>Memuat data MealDB...</p>}
        {!mealLoading && !selectedMeal && mealResults.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {mealResults.map(m => (
              <li
                key={m.idMeal}
                style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6, cursor: 'pointer' }}
                onClick={() => loadMealDetail(m.idMeal)}
              >
                <strong>{m.strMeal}</strong>
                {m.strCategory && <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>({m.strCategory})</span>}
              </li>
            ))}
          </ul>
        )}

        {lookupLoading && <p>Mengambil detail...</p>}

        {selectedMeal && !lookupLoading && (
          <div style={{ marginTop: 16, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {selectedMeal.strMealThumb && (
                <img
                  src={selectedMeal.strMealThumb}
                  alt={selectedMeal.strMeal}
                  style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px' }}>{selectedMeal.strMeal}</h3>
                <p style={{ margin: '4px 0', fontSize: 14 }}>
                  <strong>Kategori:</strong> {selectedMeal.strCategory || '-'} | <strong>Area:</strong> {selectedMeal.strArea || '-'}
                </p>
                {selectedMeal.strTags && (
                  <p style={{ margin: '4px 0', fontSize: 13 }}>Tags: {selectedMeal.strTags}</p>
                )}
                {selectedMeal.strYoutube && (
                  <p style={{ margin: '4px 0' }}>
                    <a href={selectedMeal.strYoutube} target="_blank" rel="noreferrer">YouTube</a>
                  </p>
                )}
                <button style={{ marginTop: 8 }} onClick={() => setSelectedMeal(null)}>
                  Tutup Detail
                </button>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
              <div>
                <h4>Bahan</h4>
                <ul style={{ paddingLeft: 18 }}>
                  {renderMealIngredients(selectedMeal)}
                </ul>
              </div>
              <div>
                <h4>Instruksi</h4>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.4 }}>
                  {selectedMeal.strInstructions || '-'}
                </div>
              </div>
            </div>
          </div>
        )}
        {!mealLoading && mealResults.length === 0 && mealQuery && !mealError && <p>Tidak ada hasil.</p>}
      </section>
    </div>
  );
}