// server.js - Versión corregida
require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");
const { Op } = require("sequelize");

const sequelize = require("./src/config/database");
const Producto = require("./src/models/Producto");

const productosRoutes = require("./src/routes/productosRoutes");
const categoriasRoutes = require("./src/routes/categoriasRoutes");
const cuponRoutes = require("./src/routes/cuponRoutes");
const authRoutes = require("./src/routes/authRoutes");
const clientesRoutes = require("./src/routes/clientesRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");

require("./src/models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, "ecommerce.sqlite"));

db.get("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos SQLite:", err.message);
  } else {
    console.log("✅ Conectado a la base de datos SQLite");
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos - Configuración CORRECTA
app.use(express.static(__dirname)); // Sirve todo desde la raíz
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Redirecciones para páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});

app.get('/productos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'productos.html'));
});

app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'cart.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

app.get('/contacto.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'contacto.html'));
});

// API Routes
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/cupones", cuponRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Checkout endpoint
app.post("/api/checkout", async (req, res) => {
  try {
    const { carrito, total, cupon_aplicado } = req.body;

    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({ mensaje: "El carrito está vacío" });
    }

    const today = new Date();

    for (const item of carrito) {
      const idProducto = Number(item.id);
      const cantidadSolicitada = Number(item.quantity || 1);

      const producto = await Producto.findOne({
        where: {
          id: idProducto,
          validFrom: { [Op.lte]: today },
          validTo: { [Op.gte]: today },
        },
      });

      if (!producto) {
        return res.status(400).json({
          mensaje: `Producto ${item.name} no está vigente`
        });
      }

      if (producto.stock < cantidadSolicitada) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${producto.nombre}`
        });
      }

      await producto.update({ stock: producto.stock - cantidadSolicitada });
    }

    res.json({ mensaje: "Compra realizada con éxito", total });
  } catch (error) {
    console.error("Error en checkout:", error);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// Iniciar servidor
sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
