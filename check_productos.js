// check_productos.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.sqlite');
const fs = require('fs');

db.all("SELECT id, nombre, image FROM productos", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    
    console.log("Productos en BD:\n");
    rows.forEach(row => {
        const imageName = row.image.split('/').pop();
        const exists = fs.existsSync(`./img/${imageName}`);
        console.log(`${row.id}: ${row.nombre}`);
        console.log(`   Image: ${row.image} -> ${exists ? '✅ EXISTE' : '❌ NO EXISTE'}`);
        console.log('');
    });
    
    db.close();
});