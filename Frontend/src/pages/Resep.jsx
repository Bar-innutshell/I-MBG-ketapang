import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchResep } from '../hooks/api';
import { RefreshCw, Clock, Users, ChefHat, Search } from 'lucide-react';

export default function Resep() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const search = sp.get('search') || '';
  const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
  const limit = 10;

  const [state, setState] = useState({ loading: false, data: [], pagination: null, error: '' });

  // MealDB states
  const [mealQuery, setMealQuery] = useState('');
  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState('');
  const [mealResults, setMealResults] = useState([]);

  // Random meals untuk tampilan awal
  const [randomMeals, setRandomMeals] = useState([]);
  const [randomLoading, setRandomLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Fetch random meals saat load pertama kali
  const fetchRandomMeals = async () => {
    setRandomLoading(true);
    try {
      const promises = Array(5).fill(null).map(() =>
        fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r => r.json())
      );
      const results = await Promise.all(promises);
      const meals = results.map(r => r.meals?.[0]).filter(Boolean);
      setRandomMeals(meals);
    } catch (err) {
      console.error('Failed to fetch random meals:', err);
      setRandomMeals([]);
    } finally {
      setRandomLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchRandomMeals();
  }, []);

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
    if (!mealQuery.trim()) {
      setMealResults([]);
      return;
    }
    setMealLoading(true);
    try {
      const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(mealQuery.trim())}`);
      const json = await resp.json();
      setMealResults(json.meals || []);
    } catch (err) {
      setMealError(err.message);
    } finally {
      setMealLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            🍳 Koleksi Resep
          </h1>
          <p className="text-muted-foreground">
            Temukan inspirasi masakan dari seluruh dunia
          </p>
        </div>

        {/* Random Meals Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="text-emerald-500" size={24} />
              Rekomendasi Hari Ini
            </h2>
            <button
              onClick={fetchRandomMeals}
              disabled={randomLoading}
              className="text-sm text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={14} className={randomLoading ? 'animate-spin' : ''} />
              {randomLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {randomLoading ? (
              // Skeleton loading
              Array(5).fill(null).map((_, idx) => (
                <div key={idx} className="card-base overflow-hidden">
                  <div className="h-40 skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                  </div>
                </div>
              ))
            ) : randomMeals.length > 0 ? (
              randomMeals.map((meal) => (
                <div
                  key={meal.idMeal}
                  className="card-base overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/meal/${meal.idMeal}`)}
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" title={meal.strMeal}>
                      {meal.strMeal}
                    </h3>
                    <div className="text-xs mt-1 flex items-center gap-2">
                      <span className="badge badge-emerald">
                        {meal.strCategory}
                      </span>
                      <span className="text-muted-foreground">{meal.strArea}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        30-45 min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        2-4
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-muted-foreground">
                Gagal memuat resep. <button onClick={fetchRandomMeals} className="text-emerald-600 dark:text-emerald-400 underline">Coba lagi</button>
              </div>
            )}
          </div>
        </section>


        {/* MealDB Search */}
        <section>
          <div className="section-card">
            <div className="section-header flex items-center gap-2">
              <Search size={18} className="text-emerald-500" />
              <h2 className="text-base font-semibold text-foreground">Cari Resep</h2>
            </div>

            <div className="p-4 md:p-6">
              <form onSubmit={doMealSearch} className="flex gap-2 mb-4">
                <input
                  placeholder="Cari (contoh: Chicken, Pasta, Sushi)"
                  value={mealQuery}
                  onChange={e => setMealQuery(e.target.value)}
                  className="input-base flex-1"
                />
                <button type="submit" disabled={mealLoading} className="btn-primary">
                  <Search size={16} className="mr-1" />
                  Cari
                </button>
                {mealQuery && (
                  <button
                    type="button"
                    onClick={() => { setMealQuery(''); setMealResults([]); }}
                    className="btn-ghost"
                  >
                    Clear
                  </button>
                )}
              </form>

              {mealError && <p className="text-sm text-red-500 dark:text-red-400">{mealError}</p>}
              {mealLoading && <p className="text-sm text-muted-foreground">Memuat data MealDB…</p>}

              {!mealLoading && mealResults.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mealResults.map(m => (
                    <div
                      key={m.idMeal}
                      className="card-base overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/meal/${m.idMeal}`)}
                    >
                      <div className="h-32 overflow-hidden">
                        <img
                          src={m.strMealThumb}
                          alt={m.strMeal}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {m.strMeal}
                        </h4>
                        {m.strCategory && (
                          <span className="text-xs text-muted-foreground">{m.strCategory} • {m.strArea}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!mealLoading && mealResults.length === 0 && mealQuery && !mealError && (
                <p className="text-sm text-muted-foreground">Tidak ada hasil untuk "{mealQuery}".</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
