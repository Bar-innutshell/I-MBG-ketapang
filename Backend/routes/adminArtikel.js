const express = require('express');
const router = express.Router();
const multer = require('multer');
const artikelController = require('../controllers/artikelController');

// Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes admin artikel
router.route('/')
  .get(artikelController.lihatsemuaArtikel) // untuk lihat artikel
  .post(upload.single('gambar'), artikelController.buatArtikel); // untuk buat artikel

router.route('/:id')
  .patch(upload.single('gambar'), artikelController.updateArtikel)
  .delete(artikelController.hapusArtikel);

module.exports = router;
