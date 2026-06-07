// ========== IMPORTACIONES ==========
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

require("./src/models/User");
// ========== INICIALIZACIÓN ==========
const app = express();
const PORT = process.env.PORT || 3000;

// ========== BASE DE DATOS SQLITE DIRECTA ==========
const db = new sqlite3.Database("./ecommerce.sqlite");

// Verificar conexión a la BD
db.get("SELECT 1", (err) => {
  if (err) {
    console.error(
      "❌ Error al conectar con la base de datos SQLite:",
      err.message,
    );
  } else {
    console.log("✅ Conectado a la base de datos SQLite");
  }
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// ========== RUTAS PRINCIPALES ==========
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/cupones", cuponRoutes);
app.use("/api/auth", authRoutes);


// Endpoint simple de diagnóstico
app.get("/api", (req, res) => {
  res.json({
    mensaje: "API funcionando correctamente",
    endpoints: [
      "GET /api/productos",
      "GET /api/productos?categoria=...",
      "GET /api/categorias",
      "GET /api/cupones",
      "POST /api/auth/login",
      "POST /api/checkout",
    ],
  });
});

// ========== CHECKOUT ==========
// Valida desde backend que no se puedan comprar productos vencidos o sin stock
// y descuenta el stock vendido si la compra es válida.
app.post("/api/checkout", async (req, res) => {
  try {
    const { carrito, total, cupon_aplicado } = req.body;

    if (!carrito || !Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({
        mensaje: "El carrito está vacío o tiene un formato inválido",
      });
    }

    const today = new Date();
    const productosParaActualizar = [];

    for (const item of carrito) {
      const idProducto = Number(item.id);
      const cantidadSolicitada = Number(item.quantity || item.cantidad || 1);

      if (!idProducto) {
        return res.status(400).json({
          mensaje: "Uno de los productos del carrito no tiene un ID válido",
        });
      }

      if (!cantidadSolicitada || cantidadSolicitada <= 0) {
        return res.status(400).json({
          mensaje:
            "Uno de los productos del carrito tiene una cantidad inválida",
        });
      }

      const producto = await Producto.findOne({
        where: {
          id: idProducto,
          validFrom: { [Op.lte]: today },
          validTo: { [Op.gte]: today },
        },
      });

      if (!producto) {
        return res.status(400).json({
          mensaje: `El producto ${item.name || item.nombre || idProducto} no está vigente o no existe. No se puede finalizar la compra.`,
        });
      }

      if (producto.stock < cantidadSolicitada) {
        return res.status(400).json({
          mensaje: `No hay stock suficiente para ${producto.nombre}. Stock disponible: ${producto.stock}`,
        });
      }

      productosParaActualizar.push({
        producto,
        cantidad: cantidadSolicitada,
      });
    }

    for (const item of productosParaActualizar) {
      await item.producto.update({
        stock: item.producto.stock - item.cantidad,
      });
    }

    console.log("✅ Nueva compra validada y stock descontado:", {
      carrito,
      total,
      cupon_aplicado,
    });

    res.json({
      mensaje: "Compra realizada con éxito",
      total: total,
      cupon: cupon_aplicado || null,
    });
  } catch (error) {
    console.error("❌ Error en checkout:", error);

    res.status(500).json({
      mensaje: "Error interno al procesar el checkout",
      detalle: error.message,
    });
  }
});
// ========== INICIAR SERVIDOR ==========
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Modelos sincronizados con SQLite");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al sincronizar Sequelize:", error);
  });
