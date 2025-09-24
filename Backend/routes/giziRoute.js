const express = require('express');
const router = express.Router();
const gizi = require('../controllers/giziController');

router.get('/search', gizi.searchGizi);
router.get('/:fdcId', gizi.getFoodDetail);

module.exports = router;