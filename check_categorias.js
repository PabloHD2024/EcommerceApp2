// check_categorias.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.sqlite');

db.all("SELECT DISTINCT categoria FROM productos ORDER BY categoria", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Categorías en la base de datos:");
    rows.forEach(row => {
        console.log(`- ${row.categoria}`);
    });
    db.close();
});