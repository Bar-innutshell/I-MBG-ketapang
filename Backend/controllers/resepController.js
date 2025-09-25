const Resep = require('../model/resep');
const fs = require('fs');
const path = require('path');

// Helper: parse field kompleks jika masih string
function coerceComplexFields(body) {
  const jsonFields = ['ingredients','langkahMasak','nutrisi','tags'];
  jsonFields.forEach(f => {
    if (body[f] && typeof body[f] === 'string') {
      const raw = body[f].trim();
      // Abaikan string kosong
      if (!raw) {
        body[f] = f === 'nutrisi' ? {} : [];
        return;
      }
      try {
        body[f] = JSON.parse(raw);
      } catch (e) {
        // Fallback: kalau tags dipisah koma
        if (f === 'tags') {
          body[f] = raw.split(',').map(t => t.trim()).filter(Boolean);
        } else {
          throw new Error(`Format ${f} harus JSON valid`);
        }
      }
    }
  });
  // Normalisasi tags lower-case
  if (Array.isArray(body.tags)) {
    body.tags = body.tags.map(t => (typeof t === 'string' ? t.trim().toLowerCase() : t)).filter(Boolean);
  }
  return body;
}

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
    // Clone body agar bisa modifikasi
    const updateData = { ...req.body };

    // Parse JSON string fields
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
    if (!resepTerupdate) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    res.json(resepTerupdate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hapusResep = async (req, res) => {
  try {
    const resep = await Resep.findByIdAndDelete(req.params.id);
    if (!resep) return res.status(404).json({ message: 'Resep tidak ditemukan' });
    // (Opsional) hapus file gambar
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