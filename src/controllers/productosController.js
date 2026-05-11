const productosDB = require('../data/productosData');

const productosController = {
    getAll: (req, res) => {
        const productosFrontend = productosDB.map(prod => ({
            id: prod.id,
            name: prod.nombre,
            price: prod.precio,
            image: prod.imagen,
            rating: prod.rating,
            reviews: prod.reviews
        }));
        res.json(productosFrontend);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);
        const producto = productosDB.find(prod => prod.id === id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            id: producto.id,
            name: producto.nombre,
            price: producto.precio,
            image: producto.imagen,
            rating: producto.rating,
            reviews: producto.reviews,
            stock: producto.stock,
            categoria: producto.categoria
        });
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
            categoria: nuevoProducto.categoria,
            rating: nuevoProducto.rating || 0,
            reviews: nuevoProducto.reviews || 0,
            imagen: nuevoProducto.imagen || "/img/placeholder.png"
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
        producto.imagen = datosActualizados.imagen || producto.imagen;
        producto.rating = datosActualizados.rating || producto.rating;
        producto.reviews = datosActualizados.reviews || producto.reviews;

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
    },

    getByCategoria: (req, res) => {
        const categoriaNombre = req.params.categoria;
        
        const productosFiltrados = productosDB.filter(prod => 
            prod.categoria.toLowerCase() === categoriaNombre.toLowerCase()
        );
        
        const productosFrontend = productosFiltrados.map(prod => ({
            id: prod.id,
            name: prod.nombre,
            price: prod.precio,
            image: prod.imagen,
            rating: prod.rating,
            reviews: prod.reviews
        }));
        
        res.json(productosFrontend);
    }   

};

module.exports = productosController;