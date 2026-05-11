const express = require('express');
const router = express.Router();

const cuponController = require('../controllers/cuponController');

// ORDEN CORRECTO: rutas más específicas primero
router.get('/', cuponController.getAll);
router.get('/validar/:codigo', cuponController.validar);
router.get('/aplicar/:codigo', cuponController.aplicar);
router.get('/:id', cuponController.getById);
router.post('/', cuponController.create);
router.post('/:id/usar', cuponController.registrarUso);
router.put('/:id', cuponController.update);
router.delete('/:id', cuponController.remove);

module.exports = router;