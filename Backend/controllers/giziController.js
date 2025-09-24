const axios = require('axios');

const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1';

function extractMacros(food) {
  // Coba dari foodNutrients (umum)
  const byNum = {};
  (food.foodNutrients || []).forEach(n => {
    if (n.nutrientNumber) byNum[n.nutrientNumber] = n;
    if (n.nutrient && n.nutrient.number) byNum[n.nutrient.number] = n;
  });

  const energy = byNum['1008'] || (food.foodNutrients || []).find(n => (n.nutrientName || n.nutrient?.name)?.toLowerCase().includes('energy'));
  const protein = byNum['1003'] || (food.foodNutrients || []).find(n => (n.nutrientName || n.nutrient?.name)?.toLowerCase() === 'protein');
  const fat = byNum['1004'] || (food.foodNutrients || []).find(n => (n.nutrientName || n.nutrient?.name)?.toLowerCase().includes('fat'));
  const carbs = byNum['1005'] || (food.foodNutrients || []).find(n => (n.nutrientName || n.nutrient?.name)?.toLowerCase().includes('carbohydrate'));

  let energyKcal;
  if (energy) {
    const unit = energy.unitName || energy.nutrient?.unitName || '';
    const val = energy.value ?? energy.amount;
    energyKcal = unit.toLowerCase() === 'kj' ? Math.round((val || 0) / 4.184) : val;
  }

  // Fallback untuk Branded: labelNutrients
  const ln = food.labelNutrients || {};
  const lnCal = ln.calories?.value;
  const lnProt = ln.protein?.value;
  const lnFat = ln.fat?.value;
  const lnCarb = ln.carbohydrates?.value;

  return {
    energyKcal: energyKcal ?? (lnCal ?? null),
    proteinG: (protein?.value ?? lnProt ?? null),
    fatG: (fat?.value ?? lnFat ?? null),
    carbsG: (carbs?.value ?? lnCarb ?? null),
  };
}

function mapFood(food) {
  const macros = extractMacros(food);
  return {
    fdcId: food.fdcId,
    description: food.description,
    brandOwner: food.brandOwner || null,
    dataType: food.dataType,
    servingSize: food.servingSize || null,
    servingSizeUnit: food.servingSizeUnit || null,
    macros,
  };
}

exports.searchGizi = async (req, res) => {
  try {
    const query = (req.query.query || req.query.q || '').trim();
    if (!query) return res.status(400).json({ message: 'query wajib diisi ?query=' });
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 50);
    const dataType = (req.query.dataType || '').trim(); // contoh: 'Survey (FNDDS),SR Legacy,Branded'

    const params = {
      api_key: process.env.FDC_API_KEY,
      query,
      pageNumber: page,
      pageSize,
      requireAllWords: true,
    };
    if (dataType) params.dataType = dataType;

    const { data } = await axios.get(`${FDC_BASE}/foods/search`, { params });
    const foods = (data.foods || []).map(mapFood);

    res.json({
      query,
      pagination: {
        totalHits: data.totalHits || foods.length,
        page,
        pageSize,
        totalPages: data.totalPages ?? Math.ceil((data.totalHits || foods.length) / pageSize),
      },
      data: foods,
    });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message || 'Gagal memanggil USDA' });
  }
};

exports.getFoodDetail = async (req, res) => {
  try {
    const { fdcId } = req.params;
    const { data } = await axios.get(`${FDC_BASE}/food/${fdcId}`, {
      params: { api_key: process.env.FDC_API_KEY },
    });
    res.json({
      ...mapFood(data),
      // kirimkan juga nutrient list mentah bila diperlukan UI
      foodNutrients: data.foodNutrients || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message || 'Gagal memanggil USDA' });
  }
};