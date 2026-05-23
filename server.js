// ========== IMPORTACIONES ==========
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// ========== INICIALIZACIÓN ==========
const app = express();
const PORT = process.env.PORT || 3000;

// ========== BASE DE DATOS ==========
const db = new sqlite3.Database('./ecommerce.sqlite');

// Verificar conexión a la BD
db.get("SELECT 1", (err) => {
    if (err) {
        console.error("❌ Error al conectar con la base de datos:", err.message);
    } else {
        console.log("✅ Conectado a la base de datos SQLite");
    }
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ========== ENDPOINTS ==========

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obtener un producto por ID
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

// Obtener categorías únicas
app.get('/api/categorias', (req, res) => {
    db.all("SELECT DISTINCT categoria FROM productos ORDER BY categoria", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const categorias = rows.map(row => row.categoria);
        res.json(categorias);
    });
});

// Endpoint para checkout
app.post('/api/checkout', (req, res) => {
    const { carrito, total, cupon_aplicado } = req.body;
    
    console.log("Nueva compra:", { carrito, total, cupon_aplicado });
    
    // Aquí puedes agregar lógica para guardar la compra en la BD
    
    res.json({ 
        mensaje: "Compra realizada con éxito",
        total: total,
        cupon: cupon_aplicado
    });
});

// Endpoints para cupones
app.get('/api/cupones/validar/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    
    db.get("SELECT * FROM cupones WHERE codigo = ? AND activo = 1", [codigo], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row) {
            res.json({ 
                valido: true, 
                descuento: row.descuento,
                tipo: row.tipo,
                mensaje: "Cupón válido"
            });
        } else {
            res.json({ 
                valido: false, 
                mensaje: "Cupón no válido"
            });
        }
    });
});

app.get('/api/cupones/aplicar/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const monto = parseFloat(req.query.monto) || 0;
    
    db.get("SELECT * FROM cupones WHERE codigo = ? AND activo = 1", [codigo], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.json({ mensaje: "Cupón no válido" });
            return;
        }
        
        let descuento = 0;
        if (row.tipo === 'porcentaje') {
            descuento = monto * (row.descuento / 100);
        } else {
            descuento = row.descuento;
        }
        
        const monto_final = Math.max(0, monto - descuento);
        
        res.json({
            valido: true,
            descuento: row.descuento,
            tipo: row.tipo,
            ahorro: descuento,
            monto_final: monto_final,
            mensaje: `Cupón aplicado: ${row.descuento}% de descuento`
        });
    });
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});