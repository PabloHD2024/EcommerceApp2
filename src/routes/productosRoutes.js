const express = require('express');
const router = express.Router();

const productosController = require('../controllers/productosController');

// Verificar que el controlador existe y tiene los métodos
console.log("Controlador cargado:", Object.keys(productosController));

// ORDEN CORRECTO: Rutas más específicas primero
router.get('/', productosController.getAll);
router.get('/categoria/:categoria', productosController.getByCategoria);
router.get('/:id', productosController.getById);
router.post('/', productosController.create);
router.put('/:id', productosController.update);
router.delete('/:id', productosController.remove);

module.exports = router;