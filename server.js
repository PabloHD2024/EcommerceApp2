// ========== IMPORTACIONES ==========
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");
const productosRoutes = require("./src/routes/productosRoutes");
const categoriasRoutes = require("./src/routes/categoriasRoutes");
const cuponRoutes = require("./src/routes/cuponRoutes");

require("dotenv").config();

// ========== INICIALIZACIÓN ==========
const app = express();
const PORT = process.env.PORT || 3000;

// ========== BASE DE DATOS ==========
const db = new sqlite3.Database("./ecommerce.sqlite");

// Verificar conexión a la BD
db.get("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a la base de datos SQLite");
  }
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static("."));
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/cupones", cuponRoutes);

// ========== ENDPOINTS ==========

// Obtener todos los productos
app.get("/api/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un producto por ID
app.get("/api/productos/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(row);
  });
});

// Endpoint para checkout
app.post("/api/checkout", (req, res) => {
  const { carrito, total, cupon_aplicado } = req.body;

  console.log("Nueva compra:", { carrito, total, cupon_aplicado });

  // Aquí puedes agregar lógica para guardar la compra en la BD

  res.json({
    mensaje: "Compra realizada con éxito",
    total: total,
    cupon: cupon_aplicado,
  });
});

// Endpoints para cupones

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});
