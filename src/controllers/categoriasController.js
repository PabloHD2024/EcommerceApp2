const Categoria = require('../models/Categoria');

const categoriasController = {
  getAll: async (req, res) => {
    try {
      const categorias = await Categoria.findAll();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al consultar las categorías',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id);

      if (!categoria) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }

      res.json(categoria);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al consultar la categoría',
        error: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.body.nombre || req.body.nombre.trim() === '') {
        return res.status(400).json({
          mensaje: 'El nombre de la categoría es obligatorio'
        });
      }

      const categoriaCreada = await Categoria.create({
        nombre: req.body.nombre.trim(),
        descripcion: req.body.descripcion || '',
        icono: req.body.icono || 'fa-tag'
      });

      res.status(201).json({
        mensaje: 'Categoría creada correctamente',
        categoria: categoriaCreada
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al crear la categoría',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id);

      if (!categoria) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }

      await categoria.update({
        nombre: req.body.nombre || categoria.nombre,
        descripcion: req.body.descripcion !== undefined ? req.body.descripcion : categoria.descripcion,
        icono: req.body.icono || categoria.icono
      });

      res.json({
        mensaje: 'Categoría actualizada correctamente',
        categoria
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al actualizar la categoría',
        error: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id);

      if (!categoria) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }

      await categoria.destroy();

      res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al eliminar la categoría',
        error: error.message
      });
    }
  }
};

module.exports = categoriasController;