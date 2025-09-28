const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');

// Guest hanya bisa lihat artikel
router.get('/', artikelController.lihatsemuaArtikel);
router.get('/:id', artikelController.lihatsatuArtikel);

module.exports = router;
