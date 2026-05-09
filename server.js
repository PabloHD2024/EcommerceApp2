const express = require('express');
const path = require('path');

const productosRouter = require('./src/routes/productosRoutes');
const categoriasRouter = require('./src/routes/categoriasRoutes');
const pedidoRouter = require('./src/routes/pedidoRoutes');
const detallePedidoRouter = require('./src/routes/detallePedidoRoutes');

const app = express();
const PORT = 3000;

// Permite que el servidor entienda datos en formato JSON
app.use(express.json());

// Servir TODOS los archivos estáticos
app.use(express.static(__dirname));

// Rutas principales de la API
app.use('/api/productos', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/pedido', pedidoRouter);
app.use('/api/detalle-pedido', detallePedidoRouter);

/* para probar cuando hay mas de una instancia corriendo
app.get('/api/test-pedido', (req, res) => {
    res.json({ mensaje: 'Test pedido funcionando' });
});*/

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});