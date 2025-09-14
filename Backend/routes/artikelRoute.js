const express = require('express');
const router = express.Router();
const multer = require('multer');
const artikelController = require('../controllers/artikelController');
const upload = require('../middleware/multerConfig');

router.route('/')
    .get(artikelController.lihatsemuaArtikel)
    .post(upload.single('gambar'), artikelController.buatArtikel);

router.route('/:id')
    .get(artikelController.lihatsatuArtikel)
    .patch(upload.single('gambar'), artikelController.updateArtikel)
    .delete(artikelController.hapusArtikel);

module.exports = router;