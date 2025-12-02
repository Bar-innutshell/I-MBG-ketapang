import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ChefHat, Globe, Tag, Youtube, ExternalLink } from 'lucide-react';

export default function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await res.json();
        if (data.meals && data.meals[0]) {
          setMeal(data.meals[0]);
        } else {
          setError('Resep tidak ditemukan');
        }
      } catch (err) {
        console.error('Failed to fetch meal:', err);
        setError('Gagal memuat resep. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMeal();
    }
  }, [id]);

  // Extract ingredients and measures
  const getIngredients = () => {
    if (!meal) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || '',
        });
      }
    }
    return ingredients;
  };

  // Parse instructions into steps
  const getInstructions = () => {
    if (!meal?.strInstructions) return [];
    return meal.strInstructions
      .split(/\r\n|\n|\r/)
      .filter(step => step.trim())
      .map(step => step.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 btn-primary"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!meal) return null;

  const ingredients = getIngredients();
  const instructions = getInstructions();

  return (
    <div className="min-h-screen bg-base text-foreground">
      {/* Hero Section with Image */}
      <div className="relative">
        <div className="absolute inset-0 h-[400px] overflow-hidden">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-slate-900/70 dark:to-slate-900"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 bg-white/70 dark:bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-transparent"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          {/* Title Section */}
          <div className="pt-48 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {meal.strCategory && (
                <span className="badge badge-emerald flex items-center gap-1">
                  <ChefHat size={14} />
                  {meal.strCategory}
                </span>
              )}
              {meal.strArea && (
                <span className="badge badge-blue flex items-center gap-1">
                  <Globe size={14} />
                  {meal.strArea}
                </span>
              )}
              {meal.strTags && meal.strTags.split(',').map(tag => (
                <span key={tag} className="badge badge-amber flex items-center gap-1">
                  <Tag size={14} />
                  {tag.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              {meal.strMeal}
            </h1>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-500" />
                <span>~30-45 menit</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-500" />
                <span>2-4 porsi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="card-base p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">🥘</span> Bahan-Bahan
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{ingredients.length} bahan</p>
              <ul className="space-y-3">
                {ingredients.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                      <img
                        src={`https://www.themealdb.com/images/ingredients/${item.ingredient}-Small.png`}
                        alt={item.ingredient}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="%23374151" width="40" height="40"/><text fill="%239CA3AF" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle" dy=".3em">🥄</text></svg>';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.ingredient}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.measure}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions Section */}
            <div className="card-base p-6">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span> Langkah Memasak
              </h2>
              <div className="space-y-4">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <p className="text-foreground leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Section */}
            {meal.strYoutube && (
              <div className="card-base p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Youtube className="text-red-500" size={24} />
                  Video Tutorial
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <iframe
                    src={`https://www.youtube.com/embed/${meal.strYoutube.split('v=')[1]}`}
                    title={meal.strMeal}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Source Link */}
            {meal.strSource && (
              <div className="flex justify-center">
                <a
                  href={meal.strSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary gap-2"
                >
                  <ExternalLink size={18} />
                  Lihat Resep Asli
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
