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
      <button onClick={() => navigate(-1)} className="mb-4 px-3 py-1 border rounded hover:bg-emerald-500/10">← Kembali</button>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">{d.description}</h1>
        {d.brandOwner && <p className="text-sm text-muted-foreground">{d.brandOwner}</p>}
        <div className="mt-1 text-sm text-muted-foreground">
          {d.servingSize && d.servingSizeUnit ? `Serving: ${d.servingSize} ${d.servingSizeUnit}` : 'Serving: -'}
        </div>
      </div>

      <section className="mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-card/50">
          <div className="text-xs text-muted-foreground">Kalori</div>
          <div className="text-lg font-semibold">{main?.kcal ?? '-'}</div>
        </div>
        <div className="p-3 border rounded bg-card/50">
          <div className="text-xs text-muted-foreground">Protein (g)</div>
          <div className="text-lg font-semibold">{main?.prot ?? '-'}</div>
        </div>
        <div className="p-3 border rounded bg-card/50">
          <div className="text-xs text-muted-foreground">Lemak (g)</div>
          <div className="text-lg font-semibold">{main?.fat ?? '-'}</div>
        </div>
        <div className="p-3 border rounded bg-card/50">
          <div className="text-xs text-muted-foreground">Karbo (g)</div>
          <div className="text-lg font-semibold">{main?.carb ?? '-'}</div>
        </div>
      </section>

      <div className="mb-6">
        <button onClick={addToCompare} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">
          Tambahkan 100g ke bandingkan
        </button>
        <button onClick={() => navigate('/compare-gizi?query=' + encodeURIComponent(d.description) + '&page=1')}
                className="ml-2 px-4 py-2 rounded border hover:bg-emerald-500/10">
          Buka halaman bandingkan
        </button>
      </div>

      <section className="border rounded-lg bg-card/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-base/60">
            <tr>
              <th className="text-left p-3">Nutrient</th>
              <th className="text-right p-3">Nilai</th>
              <th className="text-left p-3">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {(d.foodNutrients || []).map((n, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">{n.nutrientName || n.nutrient?.name}</td>
                <td className="p-3 text-right">{n.value ?? n.amount ?? '-'}</td>
                <td className="p-3">{n.unitName || n.nutrient?.unitName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}