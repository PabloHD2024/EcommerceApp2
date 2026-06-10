const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, isAdmin, usuariosController.getAll);

router.get('/:id', authenticateToken, isAdmin, usuariosController.getById);

router.post('/', authenticateToken, isAdmin, usuariosController.create);

router.put('/:id', authenticateToken, isAdmin, usuariosController.update);

router.delete('/:id', authenticateToken, isAdmin, usuariosController.delete);

module.exports = router;
