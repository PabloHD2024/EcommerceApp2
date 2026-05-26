const express = require("express");
const router = express.Router();

const categoriasController = require("../controllers/categoriasController");

// Obtener todas las categorías
router.get("/", categoriasController.getAll);

module.exports = router;
