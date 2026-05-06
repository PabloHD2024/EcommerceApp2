const express = require('express');
const router = express.Router();

const categoriasController = require('../controllers/categoriasController');

router.get('/', categoriasController.getAll);
router.get('/:id', categoriasController.getById);
router.post('/', categoriasController.create);
router.put('/:id', categoriasController.update);
router.delete('/:id', categoriasController.remove);

module.exports = router;