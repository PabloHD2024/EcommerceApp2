const Cliente = require('../models/Cliente');

const clientesController = {
  getAll: async (req, res) => {
    try {
      const clientes = await Cliente.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({
        error: 'Error al obtener clientes',
        detalle: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado'
        });
      }

      res.json(cliente);
    } catch (error) {
      res.status(500).json({
        error: 'Error al obtener cliente',
        detalle: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      const nuevoCliente = await Cliente.create(req.body);

      res.status(201).json({
        mensaje: 'Cliente creado correctamente',
        cliente: nuevoCliente
      });
    } catch (error) {
      res.status(400).json({
        error: 'Error al crear cliente',
        detalle: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado'
        });
      }

      await cliente.update(req.body);

      res.json({
        mensaje: 'Cliente actualizado correctamente',
        cliente
      });
    } catch (error) {
      res.status(400).json({
        error: 'Error al actualizar cliente',
        detalle: error.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado'
        });
      }

      await cliente.destroy();

      res.json({
        mensaje: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error al eliminar cliente',
        detalle: error.message
      });
    }
  }
};

module.exports = clientesController;