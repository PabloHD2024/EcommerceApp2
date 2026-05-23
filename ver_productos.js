// ver_productos.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.sqlite');

// Primero veamos qué columnas existen
db.all("PRAGMA table_info(productos)", [], (err, columns) => {
    if (err) {
        console.error(err);
        return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log("Columnas encontradas:", columnNames.join(", "));
    
    // Ahora seleccionamos todas las columnas
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("\nPrimer producto:", rows[0]);
        console.log(`\nTotal de productos: ${rows.length}`);
        db.close();
    });
});