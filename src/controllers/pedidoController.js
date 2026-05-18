const pedidoDB = require('../data/pedidoData');
const detallePedidoDB = require('../data/detallePedidoData');
const productosDB = require('../data/productosData');

const pedidoController = {
  getAll: (req, res) => {
    res.json(pedidoDB);
  },

  getById: (req, res) => {
    const id = parseInt(req.params.id);

    const pedido = pedidoDB.find(ped => ped.id === id);

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    const detalles = detallePedidoDB.filter(detalle => detalle.pedidoId === id);

    res.json({
      ...pedido,
      detalles: detalles
    });
  },

  create: (req, res) => {
    const nuevoPedido = req.body;

    if (!nuevoPedido.cliente || !nuevoPedido.productos || nuevoPedido.productos.length === 0) {
      return res.status(400).json({
        mensaje: "Los campos cliente y productos son obligatorios"
      });
    }

    const nuevoPedidoId = pedidoDB.length > 0
      ? pedidoDB[pedidoDB.length - 1].id + 1
      : 1;

    let totalPedido = 0;
    const nuevosDetalles = [];

    for (const item of nuevoPedido.productos) {
      const producto = productosDB.find(prod => prod.id === parseInt(item.productoId));

      if (!producto) {
        return res.status(404).json({
          mensaje: `Producto con id ${item.productoId} no encontrado`
        });
      }

      if (!item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad debe ser mayor a 0"
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `No hay stock suficiente para el producto ${producto.nombre}`
        });
      }

      const subtotal = producto.precio * item.cantidad;
      totalPedido += subtotal;

      const nuevoDetalleId = detallePedidoDB.length + nuevosDetalles.length > 0
        ? detallePedidoDB.length + nuevosDetalles.length + 1
        : 1;

      const detalleCreado = {
        id: nuevoDetalleId,
        pedidoId: nuevoPedidoId,
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: subtotal
      };

      nuevosDetalles.push(detalleCreado);
    }

    const pedidoCreado = {
      id: nuevoPedidoId,
      cliente: nuevoPedido.cliente,
      fecha: new Date().toISOString().split('T')[0],
      estado: "pendiente",
      total: totalPedido
    };

    pedidoDB.push(pedidoCreado);

    nuevosDetalles.forEach(detalle => {
      detallePedidoDB.push(detalle);

      const producto = productosDB.find(prod => prod.id === detalle.productoId);
      producto.stock -= detalle.cantidad;
    });

    res.status(201).json({
      mensaje: "Pedido creado correctamente",
      pedido: pedidoCreado,
      detalles: nuevosDetalles
    });
  },

  update: (req, res) => {
    const id = parseInt(req.params.id);
    const datosActualizados = req.body;

    const pedido = pedidoDB.find(ped => ped.id === id);

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    pedido.cliente = datosActualizados.cliente || pedido.cliente;
    pedido.estado = datosActualizados.estado || pedido.estado;

    res.json({
      mensaje: "Pedido actualizado correctamente",
      pedido: pedido
    });
  },

  remove: (req, res) => {
    const id = parseInt(req.params.id);

    const indicePedido = pedidoDB.findIndex(ped => ped.id === id);

    if (indicePedido === -1) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    pedidoDB.splice(indicePedido, 1);

    for (let i = detallePedidoDB.length - 1; i >= 0; i--) {
      if (detallePedidoDB[i].pedidoId === id) {
        detallePedidoDB.splice(i, 1);
      }
    }

    res.json({
      mensaje: "Pedido eliminado correctamente"
    });
  }
};

module.exports = pedidoController;