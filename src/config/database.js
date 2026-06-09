const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({
 path: path.resolve(__dirname, '../../.env')
}); // Abre la caja fuerte del .env

const storagePath = path.resolve(
 __dirname,
 '../..',
 process.env.DB_STORAGE || './ecommerce.sqlite'
);

// Configuramos Sequelize leyendo las variables de entorno
const sequelize = new Sequelize({
 dialect: process.env.DB_DIALECT || 'sqlite',
 storage: storagePath,
 logging: false
});

module.exports = sequelize;
