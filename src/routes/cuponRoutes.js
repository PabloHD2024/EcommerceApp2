const express = require('express');
const router = express.Router();

const cuponController = require('../controllers/cuponController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// ORDEN CORRECTO: rutas más específicas primero
router.get('/validar/:codigo', cuponController.validar);
router.get('/aplicar/:codigo', cuponController.aplicar);

router.get('/', authenticateToken, isAdmin, cuponController.getAll);
router.get('/:id', authenticateToken, isAdmin, cuponController.getById);
router.post('/', authenticateToken, isAdmin, cuponController.create);
router.post('/:id/usar', authenticateToken, isAdmin, cuponController.registrarUso);
router.put('/:id', authenticateToken, isAdmin, cuponController.update);
router.delete('/:id', authenticateToken, isAdmin, cuponController.remove);

module.exports = router;
