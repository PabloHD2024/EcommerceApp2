const Producto = require("../models/Producto");

const categoriasController = {
  getAll: async (req, res) => {
    try {
      const productos = await Producto.findAll({
        attributes: ["categoria"],
        group: ["categoria"],
        order: [["categoria", "ASC"]],
      });

      const categorias = productos
        .map((producto) => producto.categoria)
        .filter((categoria) => categoria !== null && categoria !== "");

      res.json(categorias);
    } catch (error) {
      console.error("ERROR REAL EN getAll CATEGORIAS:", error);
      res.status(500).json({
        error: "Error al consultar las categorías",
        detalle: error.message,
      });
    }
  },
};

module.exports = categoriasController;
