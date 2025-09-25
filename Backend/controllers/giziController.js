const axios = require('axios');
const LRU = require('lru-cache');

const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1';

// UTIL: ekstrak makro dari response USDA
function extractMacros(food) {
  const byNum = {};
  (food.foodNutrients || []).forEach(n => {
    const num = n.nutrientNumber || n.nutrient?.number;
    if (num) byNum[num] = n;
  });

  const pick = (num, fallbackMatch) => {
    if (byNum[num]) return byNum[num];
    return (food.foodNutrients || []).find(n => {
      const name = (n.nutrientName || n.nutrient?.name || '').toLowerCase();
      return name.includes(fallbackMatch);
    });
  };

  const energy = pick('1008', 'energy'); // kcal or kJ
  const protein = pick('1003', 'protein');
  const fat = pick('1004', 'fat');
  const carbs = pick('1005', 'carbohydrate');

  let energyKcal = null;
  if (energy) {
    const unit = (energy.unitName || energy.nutrient?.unitName || '').toLowerCase();
    const val = energy.value ?? energy.amount ?? null;
    if (val != null) {
      energyKcal = unit === 'kj' ? Math.round(val / 4.184) : val;
    }
  }

  const ln = food.labelNutrients || {};
  return {
    energyKcal: energyKcal ?? ln.calories?.value ?? null,
    proteinG: (protein?.value ?? ln.protein?.value ?? null),
    fatG: (fat?.value ?? ln.fat?.value ?? null),
    carbsG: (carbs?.value ?? ln.carbohydrates?.value ?? null),
  };
}

function normalizeMacros(food) {
  // ambil makro "apa adanya"
  const base = extractMacros(food);
  const servingG = (food.servingSizeUnit && String(food.servingSizeUnit).toLowerCase() === 'g')
    ? Number(food.servingSize) || null
    : null;

  // perServing (jika diketahui)
  const perServing = servingG
    ? {
        kcal: base.energyKcal ?? food.labelNutrients?.calories?.value ?? null,
        prot: base.proteinG ?? food.labelNutrients?.protein?.value ?? null,
        fat:  base.fatG ?? food.labelNutrients?.fat?.value ?? null,
        carb: base.carbsG ?? food.labelNutrients?.carbohydrates?.value ?? null,
        grams: servingG
      }
    : null;

  // per100g
  let per100g;
  if (perServing && servingG > 0) {
    per100g = {
      kcal: perServing.kcal != null ? +(perServing.kcal * (100 / servingG)).toFixed(2) : null,
      prot: perServing.prot != null ? +(perServing.prot * (100 / servingG)).toFixed(2) : null,
      fat:  perServing.fat  != null ? +(perServing.fat  * (100 / servingG)).toFixed(2) : null,
      carb: perServing.carb != null ? +(perServing.carb * (100 / servingG)).toFixed(2) : null,
    };
  } else {
    // asumsikan basis data SR/Survey sudah per 100g
    per100g = {
      kcal: base.energyKcal ?? null,
      prot: base.proteinG ?? null,
      fat:  base.fatG ?? null,
      carb: base.carbsG ?? null,
    };
  }

  return {
    basis: perServing ? 'perServing' : 'per100g',
    servingInfo: servingG ? { grams: servingG, unit: 'g' } : null,
    per100g,
    perServing
  };
}

function mapFood(food) {
  const norm = normalizeMacros(food);
  return {
    fdcId: food.fdcId,
    description: food.description,
    brandOwner: food.brandOwner || null,
    dataType: food.dataType,
    servingSize: food.servingSize || null,
    servingSizeUnit: food.servingSizeUnit || null,
    // makro mentah (tetap dikirim untuk kompatibilitas lama)
    macros: extractMacros(food),
    // nilai terstruktur untuk perbandingan
    macrosPer100g: norm.per100g,
    macrosPerServing: norm.perServing,
    basis: norm.basis,
    servingInfo: norm.servingInfo
  };
}

// CACHE sederhana (Map + TTL) — tanpa dependency
const CACHE_TTL = parseInt(process.env.CACHE_TTL_MS || '900000', 10); // 15 menit
const cacheStore = new Map();
function cacheGet(key) {
  const hit = cacheStore.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    cacheStore.delete(key);
    return null;
  }
  return hit.val;
}
function cacheSet(key, val, ttl = CACHE_TTL) {
  cacheStore.set(key, { val, exp: Date.now() + ttl });
}

// Fetch dengan timeout
const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10);
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(t);
  }
}

// GET /gizi/search
exports.searchGizi = async (req, res) => {
  try {
    const query = (req.query.query || req.query.q || '').trim();
    if (!query) return res.status(400).json({ message: 'query wajib diisi ?query=' });
    if (!process.env.FDC_API_KEY) return res.status(500).json({ message: 'FDC_API_KEY belum diset' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 50);
    const dataType = (req.query.dataType || '').trim();

    const cacheKey = `search:${query}:${page}:${pageSize}:${dataType}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(cached);
    }

    const url = new URL(`${FDC_BASE}/foods/search`);
    url.searchParams.set('api_key', process.env.FDC_API_KEY);
    url.searchParams.set('query', query);
    url.searchParams.set('pageNumber', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('requireAllWords', 'true');
    if (dataType) url.searchParams.set('dataType', dataType);

    const resp = await fetchWithTimeout(url);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return res.status(resp.status).json({ message: errText || 'Gagal memanggil USDA' });
    }
    const data = await resp.json();
    const foods = (data.foods || []).map(mapFood);

    const payload = {
      query,
      pagination: {
        totalHits: data.totalHits || foods.length,
        page,
        pageSize,
        totalPages: data.totalPages ?? Math.ceil((data.totalHits || foods.length) / pageSize),
      },
      data: foods,
    };

    cacheSet(cacheKey, payload);
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(payload);
  } catch (err) {
    const status = err.name === 'AbortError' ? 504 : 500;
    const msg = err.name === 'AbortError' ? 'Request timeout ke USDA' : err.message;
    res.status(status).json({ message: msg });
  }
};

// GET /gizi/:fdcId
exports.getFoodDetail = async (req, res) => {
  try {
    if (!process.env.FDC_API_KEY) return res.status(500).json({ message: 'FDC_API_KEY belum diset' });
    const { fdcId } = req.params;
    const cacheKey = `detail:${fdcId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json({ ...mapFood(cached), foodNutrients: cached.foodNutrients || [] });

    const url = new URL(`${FDC_BASE}/food/${fdcId}`);
    url.searchParams.set('api_key', process.env.FDC_API_KEY);

    const resp = await fetchWithTimeout(url);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return res.status(resp.status).json({ message: errText || 'Gagal memanggil USDA' });
    }
    const data = await resp.json();
    cacheSet(cacheKey, data);
    res.json({ ...mapFood(data), foodNutrients: data.foodNutrients || [] });
  } catch (err) {
    const status = err.name === 'AbortError' ? 504 : 500;
    const msg = err.name === 'AbortError' ? 'Request timeout ke USDA' : err.message;
    res.status(status).json({ message: msg });
  }
};

// Tambah helper untuk ambil detail USDA + cache
async function fetchFoodDetail(fdcId) {
  const cacheKey = `detail:${fdcId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const url = new URL(`${FDC_BASE}/food/${fdcId}`);
  url.searchParams.set('api_key', process.env.FDC_API_KEY);
  const resp = await fetchWithTimeout(url);
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(errText || `Gagal ambil detail USDA: ${resp.status}`);
  }
  const data = await resp.json();
  cacheSet(cacheKey, data);
  return data;
}

// Konversi makro per gram (support Branded per serving dan default per 100g)
function macrosPerGramFromFood(food) {
  const base = extractMacros(food);
  if (food.dataType === 'Branded' && food.servingSize && String(food.servingSizeUnit).toLowerCase() === 'g') {
    const perServing = {
      kcal: base.energyKcal ?? food.labelNutrients?.calories?.value ?? 0,
      prot: base.proteinG ?? food.labelNutrients?.protein?.value ?? 0,
      fat: base.fatG ?? food.labelNutrients?.fat?.value ?? 0,
      carb: base.carbsG ?? food.labelNutrients?.carbohydrates?.value ?? 0,
    };
    const s = Number(food.servingSize) || 1;
    return { kcal: perServing.kcal / s, prot: perServing.prot / s, fat: perServing.fat / s, carb: perServing.carb / s };
  }
  return {
    kcal: (base.energyKcal ?? 0) / 100,
    prot: (base.proteinG ?? 0) / 100,
    fat: (base.fatG ?? 0) / 100,
    carb: (base.carbsG ?? 0) / 100,
  };
}

// Endpoint hitung total nutrisi dari beberapa item
exports.estimateNutrition = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ message: 'items wajib diisi: [{ fdcId, grams }]' });
    if (!process.env.FDC_API_KEY) return res.status(500).json({ message: 'FDC_API_KEY belum diset' });

    // Ambil detail secara paralel untuk unique fdcId
    const unique = [...new Set(items.map(i => String(i.fdcId)))];
    const detailMap = {};
    await Promise.all(unique.map(async id => {
      detailMap[id] = await fetchFoodDetail(id);
    }));

    const breakdown = items.map(i => {
      const grams = Math.max(Number(i.grams) || 0, 0);
      const food = detailMap[String(i.fdcId)];
      if (!food || grams === 0) {
        return { fdcId: i.fdcId, grams, description: food?.description ?? null, macros: { kcal: 0, prot: 0, fat: 0, carb: 0 } };
      }
      const perGram = macrosPerGramFromFood(food);
      const macros = {
        kcal: +(perGram.kcal * grams).toFixed(2),
        prot: +(perGram.prot * grams).toFixed(2),
        fat: +(perGram.fat * grams).toFixed(2),
        carb: +(perGram.carb * grams).toFixed(2),
      };
      return { fdcId: i.fdcId, grams, description: food.description, macros };
    });

    const totals = breakdown.reduce((acc, x) => ({
      kcal: acc.kcal + x.macros.kcal,
      prot: acc.prot + x.macros.prot,
      fat: acc.fat + x.macros.fat,
      carb: acc.carb + x.macros.carb,
    }), { kcal: 0, prot: 0, fat: 0, carb: 0 });

    res.json({
      totals: {
        kcal: +totals.kcal.toFixed(2),
        prot: +totals.prot.toFixed(2),
        fat: +totals.fat.toFixed(2),
        carb: +totals.carb.toFixed(2),
      },
      breakdown,
    });
  } catch (err) {
    const status = err.name === 'AbortError' ? 504 : 500;
    res.status(status).json({ message: err.message || 'Gagal menghitung nutrisi' });
  }
};