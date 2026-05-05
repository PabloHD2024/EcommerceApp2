const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Permite que el servidor entienda datos en formato JSON
app.use(express.json());

// Servir TODOS los archivos estáticos
// Esto es lo más simple y debería funcionar sin problemas
app.use(express.static(__dirname));

// Base de datos simulada en memoria para Productos
let productosDB = [
    {
        id: 1,
        nombre: "Notebook Lenovo",
        precio: 850000,
        stock: 10,
        categoria: "Tecnología"
    },
    {
        id: 2,
        nombre: "Mouse inalámbrico",
        precio: 25000,
        stock: 30,
        categoria: "Tecnología"
    },
    {
        id: 3,
        nombre: "Auriculares Bluetooth",
        precio: 60000,
        stock: 15,
        categoria: "Audio"
    }
];

// GET - Obtener todos los productos
app.get('/api/productos', (req, res) => {
    res.json(productosDB);
});

// GET - Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productosDB.find(prod => prod.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.json(producto);
});

// POST - Crear un nuevo producto
app.post('/api/productos', (req, res) => {
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
});

// PUT - Actualizar un producto por ID
app.put('/api/productos/:id', (req, res) => {
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
});

// DELETE - Eliminar un producto por ID
app.delete('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const existeProducto = productosDB.some(prod => prod.id === id);

    if (!existeProducto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    productosDB = productosDB.filter(prod => prod.id !== id);

    res.json({
        mensaje: "Producto eliminado correctamente"
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});