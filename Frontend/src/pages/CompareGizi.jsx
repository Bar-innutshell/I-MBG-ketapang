import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchGizi } from '../hooks/api';

export default function CompareGizi() {
  const [sp, setSp] = useSearchParams();
  const query = sp.get('query') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const pageSize = 10;

  const [state, setState] = useState({
    loading: false,
    data: [],
    pagination: null,
    error: '',
  });

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    searchGizi({ query, page, pageSize })
      .then(json => {
        if (!active) return;
        setState({ loading: false, data: json.data || [], pagination: json.pagination || null, error: '' });
      })
      .catch(err => {
        if (!active) return;
        setState(s => ({ ...s, loading: false, error: err.message || 'Gagal memuat' }));
      });
    return () => { active = false; };
  }, [query, page]);

  const goPage = (p) => {
    const next = Math.max(1, p);
    const nextSp = new URLSearchParams(sp);
    nextSp.set('page', String(next));
    setSp(nextSp, { replace: false });
  };

  if (!query.trim()) {
    return <div style={{ padding: 16 }}>Masukkan kata kunci pencarian di halaman Home.</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Hasil Pencarian Gizi: "{query}"</h2>
      {state.loading && <p>Memuat...</p>}
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {!state.loading && !state.error && (
        <>
          {state.data.length === 0 ? (
            <p>Tidak ada hasil.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
              {state.data.map(item => (
                <li key={item.fdcId} style={{ border: '1px solid #2a2a2a', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.description}</div>
                  {item.brandOwner && <div style={{ fontSize: 12, color: '#888' }}>{item.brandOwner}</div>}
                  <div style={{ marginTop: 6, fontSize: 14 }}>
                    <span>Kalori: {item.macros?.energyKcal ?? '-'} kcal</span>{' · '}
                    <span>Protein: {item.macros?.proteinG ?? '-'} g</span>{' · '}
                    <span>Lemak: {item.macros?.fatG ?? '-'} g</span>{' · '}
                    <span>Karbo: {item.macros?.carbsG ?? '-'} g</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {state.pagination && state.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
              <span>Hal {page} / {state.pagination.totalPages}</span>
              <button onClick={() => goPage(page + 1)} disabled={page >= state.pagination.totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
