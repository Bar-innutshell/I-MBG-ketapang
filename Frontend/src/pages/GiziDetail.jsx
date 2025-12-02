import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFoodDetail } from '../hooks/api';
import { addItem as addCompareItem } from '../lib/compareStore';
import { toast } from '../lib/toast';

export default function GiziDetail() {
  const { fdcId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: '' });
    getFoodDetail(fdcId)
      .then(d => active && setState({ loading: false, data: d, error: '' }))
      .catch(e => active && setState({ loading: false, data: null, error: e.message || 'Gagal memuat' }));
    return () => { active = false; };
  }, [fdcId]);

  // Ambil nutrient utama
  const main = useMemo(() => {
    const d = state.data;
    if (!d) return null;
    const findOne = (matchFn) => (d.foodNutrients || []).find(n => {
      const name = (n.nutrientName || n.nutrient?.name || '').toLowerCase();
      return matchFn(name);
    });
    const pickVal = (n) => n ? (n.value ?? n.amount ?? null) : null;
    const energy = findOne(n => n.includes('energy') || n.includes('kalori') || n.includes('kcal') || n.includes('kilocalorie'));
    const protein = findOne(n => n.includes('protein'));
    const fat     = findOne(n => n.includes('total lipid') || n === 'fat' || n.includes('lemak'));
    const carbs   = findOne(n => n.includes('carbohydrate' || n.includes('karbo')));
    return {
      kcal: pickVal(energy),
      prot: pickVal(protein),
      fat: pickVal(fat),
      carb: pickVal(carbs),
    };
  }, [state.data]);

  const addToCompare = () => {
    if (!state.data) return;
    const ok = addCompareItem({
      fdcId: state.data.fdcId,
      description: state.data.description,
      grams: 100,
      macrosPer100g: state.data.macrosPer100G ?? null,
      servingInfo: state.data.servingInfo ?? null,
    });
    if (ok) {
      toast.success('Ditambahkan ke Bandingkan (100g).');
    } else {
      toast.info('Item sudah ada di Bandingkan.');
    }
  };

  if (state.loading) return <div className="container mx-auto px-4 py-6">Memuat...</div>;
  if (state.error) return <div className="container mx-auto px-4 py-6 text-rose-500">{state.error}</div>;

  const d = state.data;
  return (
    <div className="container mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">← Kembali</button>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">{d.description}</h1>
        {d.brandOwner && <p className="text-sm text-muted-foreground">{d.brandOwner}</p>}
        <div className="mt-1 text-sm text-muted-foreground">
          {d.servingSize && d.servingSizeUnit ? `Serving: ${d.servingSize} ${d.servingSizeUnit}` : 'Serving: -'}
        </div>
      </div>

      <section className="mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-muted-foreground">Kalori</div>
          <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{main?.kcal ?? '-'}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-muted-foreground">Protein (g)</div>
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">{main?.prot ?? '-'}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-muted-foreground">Lemak (g)</div>
          <div className="text-xl font-semibold text-amber-600 dark:text-amber-400">{main?.fat ?? '-'}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-muted-foreground">Karbo (g)</div>
          <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">{main?.carb ?? '-'}</div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={addToCompare} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
          Tambahkan 100g ke bandingkan
        </button>
        <button onClick={() => navigate('/compare-gizi?query=' + encodeURIComponent(d.description) + '&page=1')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
          Buka halaman bandingkan
        </button>
      </div>

      <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="text-left p-4 font-semibold">Nutrient</th>
              <th className="text-right p-4 font-semibold">Nilai</th>
              <th className="text-left p-4 font-semibold">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {(d.foodNutrients || []).map((n, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="p-4">{n.nutrientName || n.nutrient?.name}</td>
                <td className="p-4 text-right font-medium">{n.value ?? n.amount ?? '-'}</td>
                <td className="p-4 text-muted-foreground">{n.unitName || n.nutrient?.unitName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}