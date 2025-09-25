const Resep = require('../model/resep');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Helper: parse field kompleks jika masih string
function coerceComplexFields(body) {
  const jsonFields = ['ingredients','langkahMasak','nutrisi','tags'];
  jsonFields.forEach(f => {
    if (body[f] && typeof body[f] === 'string') {
      const raw = body[f].trim();
      if (!raw) {
        body[f] = f === 'nutrisi' ? {} : [];
        return;
      }
      try {
        body[f] = JSON.parse(raw);
      } catch (e) {
        if (f === 'tags') {
          body[f] = raw.split(',').map(t => t.trim()).filter(Boolean);
        } else {
          throw new Error(`Format ${f} harus JSON valid`);
        }
      }
    }
  });
  if (Array.isArray(body.tags)) {
    body.tags = body.tags.map(t => (typeof t === 'string' ? t.trim().toLowerCase() : t)).filter(Boolean);
  }
  return body;
}

// ========== CRUD LOKAL ==========
exports.lihatsemuaResep = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || '').trim();
    const tag = (req.query.tag || '').trim();
    const bahan = (req.query.bahan || '').trim();

    const filter = {};
    if (search) filter.judul = { $regex: search, $options: 'i' };
    if (tag) {
      const tags = tag.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (tags.length) filter.tags = { $in: tags };
    }
    if (bahan) {
      const arr = bahan.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (arr.length) filter['ingredients.nama'] = { $in: arr };
    }

    const total = await Resep.countDocuments(filter);
    const semuaResep = await Resep.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ data: semuaResep, pagination: { total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buatResep = async (req, res) => {
  try {
    coerceComplexFields(req.body);
    const resepBaru = new Resep({
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      porsi: req.body.porsi,
      durasiMenit: req.body.durasiMenit,
      tingkatKesulitan: req.body.tingkatKesulitan,
      perkiraanBiaya: req.body.perkiraanBiaya,
      ingredients: req.body.ingredients,
      langkahMasak: req.body.langkahMasak,
      nutrisi: req.body.nutrisi,
      tags: req.body.tags,
      gambar: req.file ? req.file.filename : null
    });
    await resepBaru.save();
    res.status(201).json(resepBaru);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateResep = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    try {
      coerceComplexFields(updateData);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (req.file) {
      updateData.gambar = req.file.filename;
      const resepLama = await Resep.findById(id);
      if (resepLama && resepLama.gambar) {
        const pathGambarLama = path.join(__dirname, '../uploads', resepLama.gambar);
        fs.unlink(pathGambarLama, err => {
          if (err) console.warn('Gagal hapus gambar lama:', err.message);
        });
      }
    }

    const resepTerupdate = await Resep.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!resepTerupdate) return res.status(404).json({ message: 'Resep tidak ditemukan' });
    res.json(resepTerupdate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hapusResep = async (req, res) => {
  try {
    const resep = await Resep.findByIdAndDelete(req.params.id);
    if (!resep) return res.status(404).json({ message: 'Resep tidak ditemukan' });
    if (resep.gambar) {
      const pathGambar = path.join(__dirname, '../uploads', resep.gambar);
      fs.unlink(pathGambar, () => {});
    }
    res.json({ message: 'Resep berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.lihatResepdariID = async (req, res) => {
  try {
    const resep = await Resep.findById(req.params.id);
    if (!resep) return res.status(404).json({ message: 'Resep tidak ditemukan' });
    res.json(resep);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ========== END CRUD ==========

// ========== PROXY TheMealDB ==========
const mealDbCache = new Map();
const MEALDB_TTL = 5 * 60 * 1000;
const MEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

function cacheGet(k) {
  const hit = mealDbCache.get(k);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    mealDbCache.delete(k);
    return null;
  }
  return hit.val;
}
function cacheSet(k, val) {
  mealDbCache.set(k, { val, exp: Date.now() + MEALDB_TTL });
}

async function mealdbFetch(endpointWithQuery) {
  const url = `${MEALDB_API}${endpointWithQuery}`;
  const cached = cacheGet(url);
  if (cached) return cached;
  const { data } = await axios.get(url, { timeout: 8000 });
  cacheSet(url, data);
  return data;
}

exports.mealdbSearch = async (req, res) => {
  try {
    const { s, f } = req.query;
    if (!s && !f) return res.json({ meals: null });
    const q = s ? `/search.php?s=${encodeURIComponent(s)}` : `/search.php?f=${encodeURIComponent(f)}`;
    const data = await mealdbFetch(q);
    res.json(data);
  } catch (e) {
    res.status(502).json({ meals: null, error: 'MealDB fetch failed', detail: e.message });
  }
};

exports.mealdbLookup = async (req, res) => {
  try {
    const { i } = req.query;
    if (!i) return res.json({ meals: null });
    const data = await mealdbFetch(`/lookup.php?i=${encodeURIComponent(i)}`);
    res.json(data);
  } catch (e) {
    res.status(502).json({ meals: null, error: e.message });
  }
};

exports.mealdbRandom = async (_req, res) => {
  try {
    const data = await mealdbFetch('/random.php');
    res.json(data);
  } catch (e) {
    res.status(502).json({ meals: null, error: e.message });
  }
};

exports.mealdbList = async (req, res) => {
  try {
    const { c, a, i } = req.query;
    let path = '';
    if (c === 'list') path = '/list.php?c=list';
    else if (a === 'list') path = '/list.php?a=list';
    else if (i === 'list') path = '/list.php?i=list';
    else return res.json({ meals: null });
    const data = await mealdbFetch(path);
    res.json(data);
  } catch (e) {
    res.status(502).json({ meals: null, error: e.message });
  }
};

exports.mealdbFilter = async (req, res) => {
  try {
    const { i, c, a } = req.query;
    let path = '';
    if (i) path = `/filter.php?i=${encodeURIComponent(i)}`;
    else if (c) path = `/filter.php?c=${encodeURIComponent(c)}`;
    else if (a) path = `/filter.php?a=${encodeURIComponent(a)}`;
    else return res.json({ meals: null });
    const data = await mealdbFetch(path);
    res.json(data);
  } catch (e) {
    res.status(502).json({ meals: null, error: e.message });
  }
};
// ========== END PROXY ==========