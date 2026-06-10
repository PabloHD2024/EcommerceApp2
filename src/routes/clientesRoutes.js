const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Guardar el carrito del usuario logueado en la Base de Datos
router.post('/carrito', authenticateToken, clientesController.saveCart);
// Obtener el carrito guardado del usuario logueado
router.get('/carrito/recuperar', authenticateToken, clientesController.getCartFromDb);

router.get('/', authenticateToken, isAdmin, clientesController.getAll);
router.get('/:id', authenticateToken, isAdmin, clientesController.getById);
router.post('/', authenticateToken, isAdmin, clientesController.create);
router.put('/:id', authenticateToken, isAdmin, clientesController.update);
router.delete('/:id', authenticateToken, isAdmin, clientesController.delete);

module.exports = router;
