const Producto = require('../models/Producto');

const productosController = {
    getAll: async (req, res) => {
        try {
            const productos = await Producto.findAll();

            const productosFormateados = productos.map(producto => ({
                id: producto.id,
                name: producto.nombre,
                nombre: producto.nombre,
                price: producto.precio,
                precio: producto.precio,
                stock: producto.stock,
                categoria: producto.categoria,
                image: producto.image,
                rating: producto.rating,
                reviews: producto.reviews
            }));

            res.json(productosFormateados);
        } catch (error) {
            console.error("ERROR REAL EN getAll PRODUCTOS:", error);
            res.status(500).json({
                error: "Error al consultar la base de datos",
                detalle: error.message
            });
        }
    },

    getById: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);

            if (producto) {
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
                    reviews: producto.reviews
                });
            } else {
                res.status(404).json({ error: "Producto no encontrado" });
            }
        } catch (error) {
            console.error("ERROR REAL EN getById PRODUCTOS:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    },

    create: async (req, res) => {
        try {
            const nuevoProducto = await Producto.create(req.body);
            res.status(201).json({
                mensaje: "Producto creado con éxito",
                producto: nuevoProducto
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: "Datos inválidos o incompletos" });
        }
    },

    update: async (req, res) => {
        try {
            const [actualizado] = await Producto.update(req.body, {
                where: { id: req.params.id }
            });

            if (actualizado) {
                const productoActualizado = await Producto.findByPk(req.params.id);
                res.json({
                    mensaje: "Producto actualizado correctamente",
                    producto: productoActualizado
                });
            } else {
                res.status(404).json({ error: "No se encontró el producto a actualizar" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar" });
        }
    },

    delete: async (req, res) => {
        try {
            const borrados = await Producto.destroy({
                where: { id: req.params.id }
            });

            if (borrados > 0) {
                res.json({ mensaje: "Producto eliminado correctamente" });
            } else {
                res.status(404).json({ error: "El producto no existe" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al intentar eliminar" });
        }
    }
};

module.exports = productosController;