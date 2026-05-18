const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  icono: {
    type: DataTypes.STRING,
    defaultValue: 'fa-tag'
  }
});

module.exports = Categoria;