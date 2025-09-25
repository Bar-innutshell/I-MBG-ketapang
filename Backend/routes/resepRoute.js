const express = require('express');
const router = express.Router();
const multer = require('multer');
const resepController = require('../controllers/resepController');
const upload = require('../middleware/multerConfig');
const { resepCreateRules, validate } = require('../middleware/validation');

// CRUD asli
router.route('/')
  .get(resepController.lihatsemuaResep)
  .post(upload.single('gambar'), resepCreateRules, validate, resepController.buatResep);


router.get('/mealdb/search.php', resepController.mealdbSearch);       // ?s=nama atau ?f=huruf
router.get('/mealdb/lookup.php', resepController.mealdbLookup);       // ?i=id
router.get('/mealdb/random.php', resepController.mealdbRandom);
router.get('/mealdb/list.php', resepController.mealdbList);           // ?c=list | ?a=list | ?i=list
router.get('/mealdb/filter.php', resepController.mealdbFilter);       // ?i=ing1,ing2 | ?c=cat | ?a=Area

router.route('/:id')
  .patch(upload.single('gambar'), resepController.updateResep)
  .delete(resepController.hapusResep)
  .get(resepController.lihatResepdariID);

module.exports = router;