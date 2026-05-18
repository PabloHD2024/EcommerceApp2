require('dotenv').config();

const express = require('express');
const path = require('path');
const sequelize = require('./src/config/database'); // ← Corregido: importar desde config

// IMPORTAR LOS ROUTERS desde la ubicación correcta
const productosRouter = require('./src/routes/productosRoutes');
const categoriasRouter = require('./src/routes/categoriasRoutes');
const pedidoRouter = require('./src/routes/pedidoRoutes');
const detallePedidoRouter = require('./src/routes/detallePedidoRoutes');
const ticketsRouter = require('./src/routes/ticketsRoutes');
const cuponRouter = require('./src/routes/cuponRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite que el servidor entienda datos en formato JSON
app.use(express.json());

// Servir TODOS los archivos estáticos
app.use(express.static(__dirname));

// Rutas principales de la API
app.use('/api/productos', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/pedido', pedidoRouter);
app.use('/api/detalle-pedido', detallePedidoRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/cupones', cuponRouter);

app.post('/api/checkout', (req, res) => {
    const carritoRecibido = req.body;

    console.log("🛒 Nueva compra recibida:");
    console.log(carritoRecibido);

    res.json({
        mensaje: "Ticket generado con éxito, gracias por su compra",
        carrito: carritoRecibido
    });
});

// Sincronizar base de datos y luego iniciar servidor
sequelize.sync()
    .then(() => {
        console.log('✅ Base de datos conectada y sincronizada');

        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error de conexión con la base de datos:', error);
    });