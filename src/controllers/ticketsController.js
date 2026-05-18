const Ticket = require('../models/Ticket');
const Pedido = require('../models/Pedido');

const validarId = (id) => {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0;
};

const validarTexto = (valor) => {
  return typeof valor === 'string' && valor.trim().length > 0;
};

const validarTotal = (total) => {
  return typeof total === 'number' && total >= 0;
};

const validarTipoFactura = (tipoFactura) => {
  const tiposPermitidos = ['A', 'B', 'C'];
  return validarTexto(tipoFactura) && tiposPermitidos.includes(tipoFactura.toUpperCase());
};

const ticketsController = {
  getAll: async (req, res) => {
    try {
      const tickets = await Ticket.findAll();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al consultar los tickets',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({
          mensaje: 'El id del ticket debe ser un número entero positivo'
        });
      }

      const ticket = await Ticket.findByPk(req.params.id);

      if (!ticket) {
        return res.status(404).json({ mensaje: 'Ticket no encontrado' });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al consultar el ticket',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const nuevoTicket = req.body;

      if (!validarId(nuevoTicket.id_pedido)) {
        return res.status(400).json({
          mensaje: 'El id del pedido es obligatorio y debe ser un número entero positivo'
        });
      }

      if (!validarTipoFactura(nuevoTicket.tipo_factura)) {
        return res.status(400).json({
          mensaje: 'El tipo de factura es obligatorio y debe ser A, B o C'
        });
      }

      if (!validarTexto(nuevoTicket.CAE)) {
        return res.status(400).json({
          mensaje: 'El CAE del ticket es obligatorio'
        });
      }

      const pedido = await Pedido.findByPk(nuevoTicket.id_pedido);

      if (!pedido) {
        return res.status(404).json({
          mensaje: 'No existe un pedido con ese id'
        });
      }

      const totalTicket = nuevoTicket.total !== undefined ? nuevoTicket.total : pedido.total;

      if (!validarTotal(totalTicket)) {
        return res.status(400).json({
          mensaje: 'El total del ticket debe ser un número mayor o igual a 0'
        });
      }

      const ticketCreado = await Ticket.create({
        id_pedido: nuevoTicket.id_pedido,
        fecha_emision: new Date(),
        tipo_factura: nuevoTicket.tipo_factura.toUpperCase(),
        total: totalTicket,
        CAE: nuevoTicket.CAE.trim()
      });

      res.status(201).json({
        mensaje: 'Ticket creado correctamente',
        ticket: ticketCreado
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al crear el ticket',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({
          mensaje: 'El id del ticket debe ser un número entero positivo'
        });
      }

      const ticket = await Ticket.findByPk(req.params.id);

      if (!ticket) {
        return res.status(404).json({ mensaje: 'Ticket no encontrado' });
      }

      const datosActualizados = {};

      if (req.body.id_pedido !== undefined) {
        if (!validarId(req.body.id_pedido)) {
          return res.status(400).json({
            mensaje: 'El id del pedido debe ser un número entero positivo'
          });
        }

        const pedido = await Pedido.findByPk(req.body.id_pedido);

        if (!pedido) {
          return res.status(404).json({
            mensaje: 'No existe un pedido con ese id'
          });
        }

        datosActualizados.id_pedido = req.body.id_pedido;
      }

      if (req.body.tipo_factura !== undefined) {
        if (!validarTipoFactura(req.body.tipo_factura)) {
          return res.status(400).json({
            mensaje: 'El tipo de factura debe ser A, B o C'
          });
        }

        datosActualizados.tipo_factura = req.body.tipo_factura.toUpperCase();
      }

      if (req.body.total !== undefined) {
        if (!validarTotal(req.body.total)) {
          return res.status(400).json({
            mensaje: 'El total del ticket debe ser un número mayor o igual a 0'
          });
        }

        datosActualizados.total = req.body.total;
      }

      if (req.body.CAE !== undefined) {
        if (!validarTexto(req.body.CAE)) {
          return res.status(400).json({
            mensaje: 'El CAE del ticket no puede estar vacío'
          });
        }

        datosActualizados.CAE = req.body.CAE.trim();
      }

      await ticket.update(datosActualizados);

      res.json({
        mensaje: 'Ticket actualizado correctamente',
        ticket
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al actualizar el ticket',
        error: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      if (!validarId(req.params.id)) {
        return res.status(400).json({
          mensaje: 'El id del ticket debe ser un número entero positivo'
        });
      }

      const ticket = await Ticket.findByPk(req.params.id);

      if (!ticket) {
        return res.status(404).json({ mensaje: 'Ticket no encontrado' });
      }

      await ticket.destroy();

      res.json({ mensaje: 'Ticket eliminado correctamente' });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al eliminar el ticket',
        error: error.message
      });
    }
  }
};

module.exports = ticketsController;