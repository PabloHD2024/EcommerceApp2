const productosDB = require('../data/productosData');

const validarId = (id) => {
    return Number.isInteger(id) && id > 0;
};

const validarTexto = (valor) => {
    return typeof valor === 'string' && valor.trim().length > 0;
};

const validarPrecio = (precio) => {
    return typeof precio === 'number' && precio > 0;
};

const validarStock = (stock) => {
    return Number.isInteger(stock) && stock >= 0;
};

const productosController = {
    getAll: (req, res) => {
        res.json(productosDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del producto debe ser un número entero positivo"
            });
        }

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

        if (!validarTexto(nuevoProducto.nombre)) {
            return res.status(400).json({
                mensaje: "El nombre del producto es obligatorio"
            });
        }

        if (!validarPrecio(nuevoProducto.precio)) {
            return res.status(400).json({
                mensaje: "El precio del producto debe ser un número mayor a 0"
            });
        }

        if (!validarStock(nuevoProducto.stock)) {
            return res.status(400).json({
                mensaje: "El stock del producto debe ser un número entero mayor o igual a 0"
            });
        }

        if (!validarTexto(nuevoProducto.categoria)) {
            return res.status(400).json({
                mensaje: "La categoría del producto es obligatoria"
            });
        }

        const nuevoId = productosDB.length > 0
            ? Math.max(...productosDB.map(prod => prod.id)) + 1
            : 1;

        const productoCreado = {
            id: nuevoId,
            nombre: nuevoProducto.nombre.trim(),
            precio: nuevoProducto.precio,
            stock: nuevoProducto.stock,
            categoria: nuevoProducto.categoria.trim()
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

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del producto debe ser un número entero positivo"
            });
        }

        const producto = productosDB.find(prod => prod.id === id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        if (datosActualizados.nombre !== undefined) {
            if (!validarTexto(datosActualizados.nombre)) {
                return res.status(400).json({
                    mensaje: "El nombre del producto no puede estar vacío"
                });
            }

            producto.nombre = datosActualizados.nombre.trim();
        }

        if (datosActualizados.precio !== undefined) {
            if (!validarPrecio(datosActualizados.precio)) {
                return res.status(400).json({
                    mensaje: "El precio del producto debe ser un número mayor a 0"
                });
            }

            producto.precio = datosActualizados.precio;
        }

        if (datosActualizados.stock !== undefined) {
            if (!validarStock(datosActualizados.stock)) {
                return res.status(400).json({
                    mensaje: "El stock del producto debe ser un número entero mayor o igual a 0"
                });
            }

            producto.stock = datosActualizados.stock;
        }

        if (datosActualizados.categoria !== undefined) {
            if (!validarTexto(datosActualizados.categoria)) {
                return res.status(400).json({
                    mensaje: "La categoría del producto no puede estar vacía"
                });
            }

            producto.categoria = datosActualizados.categoria.trim();
        }

        res.json({
            mensaje: "Producto actualizado correctamente",
            producto: producto
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del producto debe ser un número entero positivo"
            });
        }

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