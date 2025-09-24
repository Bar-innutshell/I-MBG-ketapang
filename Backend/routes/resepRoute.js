const express = require('express');
const router = express.Router();
const multer = require('multer');
const resepController = require('../controllers/resepController');
const upload = require('../middleware/multerConfig');
const { resepCreateRules, validate } = require('../middleware/validation');

router.route('/')
    .get(resepController.lihatsemuaResep)
    .post(upload.single('gambar'), resepCreateRules, validate, resepController.buatResep);

router.route('/:id')
    .patch(upload.single('gambar'), resepController.updateResep)
    .delete(resepController.hapusResep)
    .get(resepController.lihatResepdariID);



module.exports = router;
