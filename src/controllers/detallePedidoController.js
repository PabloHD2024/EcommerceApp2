const DetallePedido = require('../models/DetallePedido');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const sequelize = require('../config/database');

const detallePedidoController = {
  getAll: async (req, res) => {
    try {
      const detalles = await DetallePedido.findAll();
      res.json(detalles);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al consultar los detalles de pedido', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const detalle = await DetallePedido.findByPk(req.params.id);

      if (!detalle) {
        return res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
      }

      res.json(detalle);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al consultar el detalle de pedido', error: error.message });
    }
  },

  getByPedidoId: async (req, res) => {
    try {
      const pedido = await Pedido.findByPk(req.params.pedidoId);

      if (!pedido) {
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      const detalles = await DetallePedido.findAll({
        where: { pedidoId: req.params.pedidoId }
      });

      res.json(detalles);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al consultar los detalles del pedido', error: error.message });
    }
  },

  create: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const nuevoDetalle = req.body;

      if (!nuevoDetalle.pedidoId || !nuevoDetalle.productoId || !nuevoDetalle.cantidad) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: 'Los campos pedidoId, productoId y cantidad son obligatorios' });
      }

      if (nuevoDetalle.cantidad <= 0) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
      }

      const pedido = await Pedido.findByPk(nuevoDetalle.pedidoId, { transaction });

      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      }

      const producto = await Producto.findByPk(nuevoDetalle.productoId, { transaction });

      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      if (producto.stock < nuevoDetalle.cantidad) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: `No hay stock suficiente para el producto ${producto.nombre}` });
      }

      const subtotal = producto.precio * nuevoDetalle.cantidad;

      const detalleCreado = await DetallePedido.create({
        pedidoId: pedido.id,
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: nuevoDetalle.cantidad,
        precioUnitario: producto.precio,
        subtotal
      }, { transaction });

      await producto.update({
        stock: producto.stock - nuevoDetalle.cantidad
      }, { transaction });

      await pedido.update({
        total: pedido.total + subtotal
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        mensaje: 'Detalle de pedido creado correctamente',
        detalle: detalleCreado
      });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ mensaje: 'Error al crear el detalle de pedido', error: error.message });
    }
  },

  update: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const detalle = await DetallePedido.findByPk(req.params.id, { transaction });

      if (!detalle) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
      }

      if (!req.body.cantidad || req.body.cantidad <= 0) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
      }

      const pedido = await Pedido.findByPk(detalle.pedidoId, { transaction });
      const producto = await Producto.findByPk(detalle.productoId, { transaction });

      if (!pedido || !producto) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Pedido o producto asociado no encontrado' });
      }

      const cantidadAnterior = detalle.cantidad;
      const subtotalAnterior = detalle.subtotal;
      const nuevaCantidad = req.body.cantidad;
      const diferenciaCantidad = nuevaCantidad - cantidadAnterior;

      if (diferenciaCantidad > 0 && producto.stock < diferenciaCantidad) {
        await transaction.rollback();
        return res.status(400).json({ mensaje: `No hay stock suficiente para aumentar la cantidad de ${producto.nombre}` });
      }

      const nuevoSubtotal = detalle.precioUnitario * nuevaCantidad;

      await producto.update({
        stock: producto.stock - diferenciaCantidad
      }, { transaction });

      await detalle.update({
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal
      }, { transaction });

      await pedido.update({
        total: pedido.total - subtotalAnterior + nuevoSubtotal
      }, { transaction });

      await transaction.commit();

      res.json({
        mensaje: 'Detalle de pedido actualizado correctamente',
        detalle
      });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ mensaje: 'Error al actualizar el detalle de pedido', error: error.message });
    }
  },

  remove: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const detalle = await DetallePedido.findByPk(req.params.id, { transaction });

      if (!detalle) {
        await transaction.rollback();
        return res.status(404).json({ mensaje: 'Detalle de pedido no encontrado' });
      }

      const pedido = await Pedido.findByPk(detalle.pedidoId, { transaction });
      const producto = await Producto.findByPk(detalle.productoId, { transaction });

      if (pedido) {
        await pedido.update({
          total: pedido.total - detalle.subtotal
        }, { transaction });
      }

      if (producto) {
        await producto.update({
          stock: producto.stock + detalle.cantidad
        }, { transaction });
      }

      await detalle.destroy({ transaction });

      await transaction.commit();

      res.json({ mensaje: 'Detalle de pedido eliminado correctamente' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ mensaje: 'Error al eliminar el detalle de pedido', error: error.message });
    }
  }
};

module.exports = detallePedidoController;
