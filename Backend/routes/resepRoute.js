const express = require('express');
const router = express.Router();
const multer = require('multer');
const resepController = require('../controllers/resepController');
const upload = require('../middleware/multerConfig');

router.route('/')
    .get(resepController.lihatsemuaResep)
    .post(upload.single('gambar'), resepController.buatResep);


module.exports = router;
