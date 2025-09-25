const { body, validationResult } = require('express-validator');

const artikelRules = [
  body('judul').notEmpty().withMessage('judul wajib diisi'),
  body('isi').notEmpty().withMessage('isi wajib diisi'),
];

const resepCreateRules = [
  body('judul').notEmpty().withMessage('judul wajib diisi'),
  body('ingredients').custom((v, { req }) => {
    // terima array JS atau JSON string array
    const val = typeof v === 'string' ? JSON.parse(v) : v;
    if (!Array.isArray(val) || val.length === 0) throw new Error('ingredients harus array dan tidak boleh kosong');
    return true;
  }),
  body('langkahMasak').custom((v, { req }) => {
    const val = typeof v === 'string' ? JSON.parse(v) : v;
    if (!Array.isArray(val) || val.length === 0) throw new Error('langkahMasak harus array dan tidak boleh kosong');
    return true;
  }),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

module.exports = { artikelRules, resepCreateRules, validate };