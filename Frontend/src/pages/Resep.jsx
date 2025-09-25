import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchResep } from '../hooks/api';

export default function Resep() {
  const [sp, setSp] = useSearchParams();
  const search = sp.get('search') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const limit = 10;

  const [state, setState] = useState({ loading: false, data: [], pagination: null, error: '' });

  useEffect(() => {
    let active = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    fetchResep({ search, page, limit })
      .then(json => active && setState({ loading: false, data: json.data || [], pagination: json.pagination || null, error: '' }))
      .catch(err => active && setState(s => ({ ...s, loading: false, error: err.message })));
    return () => { active = false; };
  }, [search, page]);

  const goPage = (next) => {
    const nextPage = Math.max(1, next);
    const nextParams = new URLSearchParams(sp);
    nextParams.set('page', String(nextPage));
    setSp(nextParams, { replace: false });
  };

  return (
    <div>
      {state.loading && <p>Memuat...</p>}
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {!state.loading && !state.error && (
        <>
          <ul>
            {state.data.map((r) => (
              <li key={r._id}>{r.judul}</li>
            ))}
          </ul>
          {state.pagination && state.pagination.total > limit && (
            <div style={{ display: 'flex', gap: 8 }}>
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
