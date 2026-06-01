const Producto = require("../models/Producto");
const { Op } = require("sequelize");

const productosController = {
  getAll: async (req, res) => {
    try {
      const { categoria } = req.query;
      const today = new Date();

      const whereCondition = {
        validFrom: { [Op.lte]: today },
        validTo: { [Op.gte]: today },
      };

      if (categoria) {
        whereCondition.categoria = categoria;
      }

      const productos = await Producto.findAll({
        where: whereCondition,
      });

      const productosFormateados = productos.map((producto) => ({
        id: producto.id,
        name: producto.nombre,
        nombre: producto.nombre,
        price: producto.precio,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        image: producto.image,
        rating: producto.rating,
        reviews: producto.reviews,
        validFrom: producto.validFrom,
        validTo: producto.validTo,
      }));

      res.json(productosFormateados);
    } catch (error) {
      console.error("ERROR REAL EN getAll PRODUCTOS:", error);
      res.status(500).json({
        error: "Error al consultar la base de datos",
        detalle: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json({
        id: producto.id,
        name: producto.nombre,
        nombre: producto.nombre,
        price: producto.precio,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        image: producto.image,
        rating: producto.rating,
        reviews: producto.reviews,
        validFrom: producto.validFrom,
        validTo: producto.validTo,
      });
    } catch (error) {
      console.error("ERROR REAL EN getById PRODUCTOS:", error);
      res.status(500).json({
        error: "Error en el servidor",
        detalle: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      console.log("BODY RECIBIDO:", req.body);

      const nuevoProducto = await Producto.create(req.body);

      res.status(201).json({
        mensaje: "Producto creado con éxito",
        producto: nuevoProducto,
      });
    } catch (error) {
      console.error("ERROR REAL AL CREAR PRODUCTO:", error);

      res.status(400).json({
        error: "Datos inválidos o incompletos",
        detalle: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const [actualizado] = await Producto.update(req.body, {
        where: { id: req.params.id },
      });

      if (!actualizado) {
        return res.status(404).json({
          error: "No se encontró el producto a actualizar",
        });
      }

      const productoActualizado = await Producto.findByPk(req.params.id);

      res.json({
        mensaje: "Producto actualizado correctamente",
        producto: productoActualizado,
      });
    } catch (error) {
      console.error("ERROR REAL AL ACTUALIZAR PRODUCTO:", error);
      res.status(500).json({
        error: "Error al actualizar",
        detalle: error.message,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const borrados = await Producto.destroy({
        where: { id: req.params.id },
      });

      if (borrados === 0) {
        return res.status(404).json({
          error: "El producto no existe",
        });
      }

      res.json({
        mensaje: "Producto eliminado correctamente",
      });
    } catch (error) {
      console.error("ERROR REAL AL ELIMINAR PRODUCTO:", error);
      res.status(500).json({
        error: "Error al intentar eliminar",
        detalle: error.message,
      });
    }
  },
};

module.exports = productosController;