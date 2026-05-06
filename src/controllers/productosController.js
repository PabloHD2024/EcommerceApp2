const productosDB = require('../data/productosData');

const productosController = {
    getAll: (req, res) => {
        res.json(productosDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

        const producto = productosDB.find(prod => prod.id === id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(producto);
    },

    create: (req, res) => {
        const nuevoProducto = req.body;

        if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock || !nuevoProducto.categoria) {
            return res.status(400).json({
                mensaje: "Los campos nombre, precio, stock y categoria son obligatorios"
            });
        }

        const nuevoId = productosDB.length > 0
            ? productosDB[productosDB.length - 1].id + 1
            : 1;

        const productoCreado = {
            id: nuevoId,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            stock: nuevoProducto.stock,
            categoria: nuevoProducto.categoria
        };

        productosDB.push(productoCreado);

        res.status(201).json({
            mensaje: "Producto creado correctamente",
            producto: productoCreado
        });
    },

    update: (req, res) => {
        const id = parseInt(req.params.id);
        const datosActualizados = req.body;

        const producto = productosDB.find(prod => prod.id === id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        producto.nombre = datosActualizados.nombre || producto.nombre;
        producto.precio = datosActualizados.precio || producto.precio;
        producto.stock = datosActualizados.stock || producto.stock;
        producto.categoria = datosActualizados.categoria || producto.categoria;

        res.json({
            mensaje: "Producto actualizado correctamente",
            producto: producto
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

        const indiceProducto = productosDB.findIndex(prod => prod.id === id);

        if (indiceProducto === -1) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        productosDB.splice(indiceProducto, 1);

        res.json({
            mensaje: "Producto eliminado correctamente"
        });
    }
};

module.exports = productosController;