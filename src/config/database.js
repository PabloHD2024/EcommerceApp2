const { Sequelize } = require('sequelize');
require('dotenv').config(); // Abre la caja fuerte del .env
// Configuramos Sequelize leyendo las variables de entorno
const sequelize = new Sequelize({
 dialect: process.env.DB_DIALECT,
 storage: process.env.DB_STORAGE
});
module.exports = sequelize;