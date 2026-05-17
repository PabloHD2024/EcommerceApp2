const express = require('express');
const router = express.Router();

const ticketsController = require('../controllers/ticketsController');

router.get('/', ticketsController.getAll);
router.get('/:id', ticketsController.getById);
router.post('/', ticketsController.create);
router.put('/:id', ticketsController.update);
router.delete('/:id', ticketsController.remove);

module.exports = router;