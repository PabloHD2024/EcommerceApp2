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
  },
  
  saveCart: async (req, res) => {
        try {
            const userId = req.user.id; 
            const { carrito } = req.body; // Array con los productos del carrito

            if (!carrito) {
                return res.status(400).json({ success: false, message: "El carrito está vacío o no fue enviado." });
            }

            // Actualizamos la columna 'carrito' convirtiendo el array a string de texto JSON
            await User.update(
                { carrito: JSON.stringify(carrito) },
                { where: { id: userId } }
            );

            return res.json({ success: true, message: "Carrito guardado en la base de datos con éxito." });
        } catch (error) {
            console.error("Error al guardar el carrito:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Error interno al respaldar el carrito.", 
                detalle: error.message 
            });
        }
    },

    // NUEVO MÉTODO: Trae el carrito de la BD cuando el usuario inicia sesión de cero
    getCartFromDb: async (req, res) => {
        try {
            const userId = req.user.id;

            const usuario = await User.findByPk(userId);
            if (!usuario) {
                return res.status(404).json({ success: false, message: "Usuario no encontrado." });
            }

            // Si hay un carrito guardado lo parseamos a Array, sino devolvemos un array vacío []
            const carritoGuardado = usuario.carrito ? JSON.parse(usuario.carrito) : [];

            return res.json({ success: true, carrito: carritoGuardado });
        } catch (error) {
            console.error("Error al recuperar el carrito:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Error interno al recuperar el carrito.", 
                detalle: error.message 
            });
        }
    }
};

module.exports = clientesController;