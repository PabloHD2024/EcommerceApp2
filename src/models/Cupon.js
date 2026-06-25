const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cupon = sequelize.define('Cupon', {

  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      if (val) this.setDataValue('codigo', val.toUpperCase().trim());
    }
  },

  descuento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  
  limite_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  usos_actuales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Cupons'
});

Cupon.prototype.esValido = function () {
  const hoy = new Date().toISOString().split('T')[0];
  const noVencido = this.fecha_vencimiento >= hoy;
  const noAgotado = this.usos_actuales < this.limite_stock;

  return this.activo && noVencido && noAgotado;
};

Cupon.prototype.aplicarDescuento = function (monto) {
  if (!this.esValido()) {
    throw new Error('El cupón no es válido');
  }

  return monto - (monto * this.descuento / 100);
};

module.exports = Cupon;
