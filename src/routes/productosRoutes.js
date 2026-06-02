const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productosController");

const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

// Obtener todos los productos - público
router.get("/", productosController.getAll);

// Obtener un producto por ID - público
router.get("/:id", productosController.getById);

// Crear un producto - solo admin
router.post("/", authenticateToken, isAdmin, productosController.create);

// Actualizar un producto - solo admin
router.put("/:id", authenticateToken, isAdmin, productosController.update);

// Eliminar un producto - solo admin
router.delete("/:id", authenticateToken, isAdmin, productosController.delete);

module.exports = router;
