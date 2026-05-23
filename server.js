require('dotenv').config();

const cors = require('cors');
const express = require('express');
const path = require('path');
const db = new sqlite3.Database('./ecommerce.sqlite');
const sequelize = require('./src/config/database');

const productosRouter = require('./src/routes/productosRoutes');
const categoriasRouter = require('./src/routes/categoriasRoutes');
const pedidoRouter = require('./src/routes/pedidoRoutes');
const detallePedidoRouter = require('./src/routes/detallePedidoRoutes');
const ticketsRouter = require('./src/routes/ticketsRoutes');
const cuponRouter = require('./src/routes/cuponRoutes');
const clientesRouter = require('./src/routes/clientesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//Permite peticiones desde el front:
app.use(cors());

// Permite que el servidor entienda datos en formato JSON
app.use(express.json());

// Servir TODOS los archivos estáticos
app.use(express.static('.'));

// Endpoint para obtener todos los productos
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM productos WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(row);
    });
});

// Rutas principales de la API
app.use('/api/productos', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/pedido', pedidoRouter);
app.use('/api/detalle-pedido', detallePedidoRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/cupones', cuponRouter);
app.use('/api/clientes', clientesRouter);

app.use('/img', express.static(path.join(__dirname, 'img')));

app.post('/api/checkout', (req, res) => {
  const carritoRecibido = req.body;

  console.log('🛒 Nueva compra recibida:');
  console.log(carritoRecibido);

  res.json({
    mensaje: 'Ticket generado con éxito, gracias por su compra',
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