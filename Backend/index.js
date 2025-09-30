const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/error');
const client = require('prom-client');


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Berhasil terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static uploads (tetap untuk dev; untuk prod/serverless disarankan Cloudinary)
app.use('/uploads', express.static('uploads'));

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', time: new Date().toISOString() }));

// Rate limit dasar untuk API publik
app.use(['/artikel','/resep'], rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const artikelRoute = require('./routes/artikelRoute');
const resepRoute = require('./routes/resepRoute');
const giziRoute = require('./routes/giziRoute');

app.use('/artikel', artikelRoute);
app.use('/resep', resepRoute);
app.use('/gizi', giziRoute);

// Route admin
const adminArtikelRoute = require('./routes/adminArtikel'); // <-- pastikan path & nama file benar
app.use('/api/admin/artikel', adminArtikelRoute);

// Metrics endpoint
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Nonaktifkan cache untuk semua route
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/artikel/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Mencari artikel dengan ID:", id);

  try {
    const artikel = await ArtikelModel.findById(id);
    console.log("Hasil query:", artikel);

    if (!artikel) return res.status(404).json({ message: "Artikel tidak ditemukan" });

    res.json({ data: artikel });
  } catch (err) {
    console.error("Error query artikel:", err.message);
    res.status(500).json({ message: err.message });
  }
});


// 404 + Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server lagi jalan nih di http://localhost:${port}`);
});

