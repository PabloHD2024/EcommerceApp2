const express = require('express');
const router = express.Router();

const detallePedidoController = require('../controllers/detallePedidoController');

router.get('/', detallePedidoController.getAll);
router.get('/pedido/:pedidoId', detallePedidoController.getByPedidoId);
router.get('/:id', detallePedidoController.getById);
router.post('/', detallePedidoController.create);
router.put('/:id', detallePedidoController.update);
router.delete('/:id', detallePedidoController.remove);

module.exports = router;