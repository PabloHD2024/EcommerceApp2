const sequelize = require('../config/database');
const Producto = require('./Producto');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');

// Definir relaciones aquí si las hay

module.exports = {
    sequelize,
    Producto,
    Pedido,
    DetallePedido
};