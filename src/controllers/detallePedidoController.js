const detallePedidoDB = require('../data/detallePedidoData');
const pedidoDB = require('../data/pedidoData');
const productosDB = require('../data/productosData');

const detallePedidoController = {
  getAll: (req, res) => {
    res.json(detallePedidoDB);
  },

  getById: (req, res) => {
    const id = parseInt(req.params.id);

    const detalle = detallePedidoDB.find(det => det.id === id);

    if (!detalle) {
      return res.status(404).json({
        mensaje: "Detalle de pedido no encontrado"
      });
    }

    res.json(detalle);
  },

  getByPedidoId: (req, res) => {
    const pedidoId = parseInt(req.params.pedidoId);

    const pedido = pedidoDB.find(ped => ped.id === pedidoId);

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    const detalles = detallePedidoDB.filter(det => det.pedidoId === pedidoId);

    res.json(detalles);
  },

  create: (req, res) => {
    const nuevoDetalle = req.body;

    if (!nuevoDetalle.pedidoId || !nuevoDetalle.productoId || !nuevoDetalle.cantidad) {
      return res.status(400).json({
        mensaje: "Los campos pedidoId, productoId y cantidad son obligatorios"
      });
    }

    const pedido = pedidoDB.find(ped => ped.id === parseInt(nuevoDetalle.pedidoId));

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    const producto = productosDB.find(prod => prod.id === parseInt(nuevoDetalle.productoId));

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    if (nuevoDetalle.cantidad <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser mayor a 0"
      });
    }

    if (producto.stock < nuevoDetalle.cantidad) {
      return res.status(400).json({
        mensaje: `No hay stock suficiente para el producto ${producto.nombre}`
      });
    }

    const nuevoId = detallePedidoDB.length > 0
      ? detallePedidoDB[detallePedidoDB.length - 1].id + 1
      : 1;

    const subtotal = producto.precio * nuevoDetalle.cantidad;

    const detalleCreado = {
      id: nuevoId,
      pedidoId: pedido.id,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad: nuevoDetalle.cantidad,
      precioUnitario: producto.precio,
      subtotal: subtotal
    };

    detallePedidoDB.push(detalleCreado);

    producto.stock -= nuevoDetalle.cantidad;
    pedido.total += subtotal;

    res.status(201).json({
      mensaje: "Detalle de pedido creado correctamente",
      detalle: detalleCreado
    });
  },

  update: (req, res) => {
    const id = parseInt(req.params.id);
    const datosActualizados = req.body;

    const detalle = detallePedidoDB.find(det => det.id === id);

    if (!detalle) {
      return res.status(404).json({
        mensaje: "Detalle de pedido no encontrado"
      });
    }

    if (!datosActualizados.cantidad || datosActualizados.cantidad <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser mayor a 0"
      });
    }

    const pedido = pedidoDB.find(ped => ped.id === detalle.pedidoId);
    const producto = productosDB.find(prod => prod.id === detalle.productoId);

    const subtotalAnterior = detalle.subtotal;
    const cantidadAnterior = detalle.cantidad;

    const diferenciaCantidad = datosActualizados.cantidad - cantidadAnterior;

    if (diferenciaCantidad > 0 && producto.stock < diferenciaCantidad) {
      return res.status(400).json({
        mensaje: `No hay stock suficiente para aumentar la cantidad de ${producto.nombre}`
      });
    }

    producto.stock -= diferenciaCantidad;

    detalle.cantidad = datosActualizados.cantidad;
    detalle.subtotal = detalle.precioUnitario * detalle.cantidad;

    pedido.total = pedido.total - subtotalAnterior + detalle.subtotal;

    res.json({
      mensaje: "Detalle de pedido actualizado correctamente",
      detalle: detalle
    });
  },

  remove: (req, res) => {
    const id = parseInt(req.params.id);

    const indiceDetalle = detallePedidoDB.findIndex(det => det.id === id);

    if (indiceDetalle === -1) {
      return res.status(404).json({
        mensaje: "Detalle de pedido no encontrado"
      });
    }

    const detalle = detallePedidoDB[indiceDetalle];

    const pedido = pedidoDB.find(ped => ped.id === detalle.pedidoId);
    const producto = productosDB.find(prod => prod.id === detalle.productoId);

    if (pedido) {
      pedido.total -= detalle.subtotal;
    }

    if (producto) {
      producto.stock += detalle.cantidad;
    }

    detallePedidoDB.splice(indiceDetalle, 1);

    res.json({
      mensaje: "Detalle de pedido eliminado correctamente"
    });
  }
};

module.exports = detallePedidoController;