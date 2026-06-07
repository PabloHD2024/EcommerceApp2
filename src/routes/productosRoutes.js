const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productosController");
const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

console.log("Controlador cargado:", Object.keys(productosController));

// Rutas públicas
router.get("/", productosController.getAll);
router.get("/:id", productosController.getById);

// Rutas protegidas: solo admin autenticado
router.post("/", authenticateToken, isAdmin, productosController.create);
router.put("/:id", authenticateToken, isAdmin, productosController.update);
router.delete("/:id", authenticateToken, isAdmin, productosController.delete);

module.exports = router;