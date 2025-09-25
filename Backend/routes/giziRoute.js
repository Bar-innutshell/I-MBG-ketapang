const express = require('express');
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const gizi = require('../controllers/giziController');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
router.use(limiter);

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.get(
  '/search',
  [ query('query').trim().isLength({ min: 2 }), query('page').optional().isInt({ min: 1 }), query('pageSize').optional().isInt({ min: 1, max: 50 }) ],
  validate,
  gizi.searchGizi
);

router.get('/:fdcId', gizi.getFoodDetail);

router.post(
  '/estimate',
  [ body('items').isArray({ min: 1 }), body('items.*.fdcId').exists(), body('items.*.grams').isFloat({ min: 0 }) ],
  validate,
  gizi.estimateNutrition
);

module.exports = router;