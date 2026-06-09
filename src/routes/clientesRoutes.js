const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

const { authenticateToken } = require('../middlewares/authMiddleware');

// Guardar el carrito del usuario logueado en la Base de Datos
router.post('/carrito', authenticateToken, clientesController.saveCart);
// Obtener el carrito guardado del usuario logueado
router.get('/carrito/recuperar', authenticateToken, clientesController.getCartFromDb);

router.get('/', clientesController.getAll);
router.get('/:id', clientesController.getById);
router.post('/', clientesController.create);
router.put('/:id', clientesController.update);
router.delete('/:id', clientesController.delete);

module.exports = router;