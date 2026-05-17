require('dotenv').config();

console.log('=== TEST DE CONEXIÓN ===');
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_STORAGE:', process.env.DB_STORAGE);

const sequelize = require('./src/config/database');
console.log('1. Sequelize importado:', typeof sequelize);

const Producto = require('./src/models/Producto');
console.log('2. Producto importado:', typeof Producto);
console.log('3. Producto es función/objeto:', Producto);

if (Producto && typeof Producto === 'function') {
    console.log('✅ Modelo Producto válido');
} else {
    console.log('❌ Modelo Producto inválido');
    process.exit(1);
}

console.log('✅ Test pasado - el modelo se importa correctamente');
process.exit(0);
