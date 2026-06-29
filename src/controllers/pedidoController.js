const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto = require('../models/Producto');
const sequelize = require('../config/database');

const pedidoController = {
  getAll: async (req, res) => {
    try {
      const pedidos = await Pedido.findAll();
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al consultar los pedidos', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id);

      if (!pedido) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      const detalles = await DetallePedido.findAll({
        where: { pedidoId: req.params.id }
      });

      res.json({
        ...pedido.toJSON(),
        detalles
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al consultar el pedido', error: error.message });
    }
  },

  create: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const nuevoPedido = req.body;

      if (!nuevoPedido.cliente || !nuevoPedido.productos || nuevoPedido.productos.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: 'Los campos cliente y productos son obligatorios' });
      }

      let totalPedido = 0;
      const detallesAInsertar = [];

      for (const item of nuevoPedido.productos) {
        if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
          await transaction.rollback();
          return res.status(400).json({ mensaje: 'Cada producto debe tener productoId y cantidad mayor a 0' });
        }

        const producto = await Producto.findByPk(item.productoId, { transaction });

        if (!producto) {
          await transaction.rollback();
          return res.status(404).json({ mensaje: `Producto con id ${item.productoId} no encontrado` });
        }

        if (producto.stock < item.cantidad) {
          await transaction.rollback();
          return res.status(400).json({ mensaje: `No hay stock suficiente para el producto ${producto.nombre}` });
        }

        const subtotal = producto.precio * item.cantidad;
        totalPedido += subtotal;

        detallesAInsertar.push({
          producto,
          cantidad: item.cantidad,
          subtotal
        });
      }

      const pedidoCreado = await Pedido.create({
        cliente: nuevoPedido.cliente,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente',
        total: totalPedido
      }, { transaction });

      const detallesCreados = [];

      for (const item of detallesAInsertar) {
        const detalleCreado = await DetallePedido.create({
          pedidoId: pedidoCreado.id,
          productoId: item.producto.id,
          nombreProducto: item.producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          subtotal: item.subtotal
        }, { transaction });

        await item.producto.update({
          stock: item.producto.stock - item.cantidad
        }, { transaction });

        detallesCreados.push(detalleCreado);
      }

      await transaction.commit();

      res.status(201).json({
        mensaje: 'Pedido creado correctamente',
        pedido: pedidoCreado,
        detalles: detallesCreados
      });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id);

      if (!pedido) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      await pedido.update({
        cliente: req.body.cliente || pedido.cliente,
        estado: req.body.estado || pedido.estado
      });

      res.json({
        mensaje: 'Pedido actualizado correctamente',
        pedido
      });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar el pedido', error: error.message });
    }
  },

  remove: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(req.params.id, { transaction });

      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      await DetallePedido.destroy({
        where: { pedidoId: req.params.id },
        transaction
      });

      await pedido.destroy({ transaction });

      await transaction.commit();

      res.json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ mensaje: 'Error al eliminar el pedido', error: error.message });
    }
  }
};

module.exports = pedidoController;
