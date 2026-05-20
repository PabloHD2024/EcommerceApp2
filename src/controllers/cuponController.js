const Cupon = require('../models/Cupon');

const cuponController = {
  // GET /api/cupones
  getAll: async (req, res) => {
    try {
      const cupones = await Cupon.findAll();

      const respuesta = cupones.map((cupon) => ({
        ...cupon.toJSON(),
        id_cupon: cupon.id,
        es_valido: cupon.esValido()
      }));

      res.json(respuesta);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener cupones',
        detalle: error.message
      });
    }
  },

  // GET /api/cupones/:id
  getById: async (req, res) => {
    try {
      const cupon = await Cupon.findByPk(req.params.id);

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado'
        });
      }

      res.json({
        ...cupon.toJSON(),
        id_cupon: cupon.id,
        es_valido: cupon.esValido()
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener cupón',
        detalle: error.message
      });
    }
  },

  // // GET /api/cupones/validar/:codigo
  // validar: async (req, res) => {
  //   try {
  //     const cupon = await Cupon.findByPk(req.params.codigo);

  //     if (!cupon) {
  //       return res.status(404).json({
  //         mensaje: 'Cupón no encontrado',
  //         valido: false
  //       });
  //     }

  //     const valido = cupon.esValido();

  //     res.json({
  //       id_cupon: cupon.id,
  //       descuento: cupon.descuento,
  //       valido,
  //       mensaje: valido
  //         ? 'Cupón válido'
  //         : 'Cupón no válido (vencido, agotado o inactivo)'
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       mensaje: 'Error al validar cupón',
  //       detalle: error.message
  //     });
  //   }
  // },

  // GET /api/cupones/validar/:codigo
  validar: async (req, res) => {
    try {
      // CAMBIO: Buscamos usando findOne y forzamos mayúsculas
      const cupon = await Cupon.findOne({
        where: {
          codigo: req.params.codigo.toUpperCase().trim()
        }
      });

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado',
          valido: false
        });
      }

      const valido = cupon.esValido();

      res.json({
        id_cupon: cupon.id,
        codigo: cupon.codigo, // Opcional: sumamos el código a la respuesta
        descuento: cupon.descuento,
        valido,
        mensaje: valido
          ? 'Cupón válido'
          : 'Cupón no válido (vencido, agotado o inactivo)'
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al validar cupón',
        detalle: error.message
      });
    }
  },

  // GET /api/cupones/aplicar/:codigo?monto=100
  // aplicar: async (req, res) => {
  //   try {
  //     const monto = parseFloat(req.query.monto);

  //     if (!monto || monto <= 0) {
  //       return res.status(400).json({
  //         mensaje: "El parámetro 'monto' es requerido y debe ser mayor a 0"
  //       });
  //     }

  //     const cupon = await Cupon.findByPk(req.params.codigo);

  //     if (!cupon) {
  //       return res.status(404).json({
  //         mensaje: 'Cupón no encontrado'
  //       });
  //     }

  //     if (!cupon.esValido()) {
  //       return res.status(400).json({
  //         mensaje: 'El cupón no es válido',
  //         valido: false
  //       });
  //     }

  //     const montoConDescuento = cupon.aplicarDescuento(monto);
  //     const ahorro = monto - montoConDescuento;

  //     res.json({
  //       id_cupon: cupon.id,
  //       descuento: cupon.descuento,
  //       monto_original: monto,
  //       monto_final: montoConDescuento,
  //       ahorro,
  //       mensaje: `¡Cupón aplicado! Ahorraste $${ahorro.toFixed(2)}`
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       mensaje: 'Error al aplicar cupón',
  //       detalle: error.message
  //     });
  //   }
  // },

  // GET /api/cupones/aplicar/:codigo?monto=100
  aplicar: async (req, res) => {
    try {
      const monto = parseFloat(req.query.monto);

      if (!monto || monto <= 0) {
        return res.status(400).json({
          mensaje: "El parámetro 'monto' es requerido y debe ser mayor a 0"
        });
      }

      // CAMBIO: Buscamos usando findOne y forzamos mayúsculas
      const cupon = await Cupon.findOne({
        where: {
          codigo: req.params.codigo.toUpperCase().trim()
        }
      });

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado'
        });
      }

      if (!cupon.esValido()) {
        return res.status(400).json({
          mensaje: 'El cupón no es válido',
          valido: false
        });
      }

      const montoConDescuento = cupon.aplicarDescuento(monto);
      const ahorro = monto - montoConDescuento;

      res.json({
        id_cupon: cupon.id,
        codigo: cupon.codigo,
        descuento: cupon.descuento,
        monto_original: monto,
        monto_final: montoConDescuento,
        ahorro,
        mensaje: `¡Cupón aplicado! Ahorraste $${ahorro.toFixed(2)}`
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al aplicar cupón',
        detalle: error.message
      });
    }
  },

  // POST /api/cupones
  create: async (req, res) => {
    try {
      const { codigo, descuento, fecha_vencimiento, limite_stock } = req.body;

      if (!descuento || !fecha_vencimiento || !limite_stock) {
        return res.status(400).json({
          mensaje: 'Los campos descuento, fecha_vencimiento y limite_stock son obligatorios'
        });
      }

      const cuponCreado = await Cupon.create({
        codigo,
        descuento,
        fecha_vencimiento,
        limite_stock,
        usos_actuales: 0,
        activo: true
      });

      res.status(201).json({
        mensaje: 'Cupón creado correctamente',
        cupon: {
          ...cuponCreado.toJSON(),
          id_cupon: cuponCreado.id
        }
      });
    } catch (error) {
      res.status(400).json({
        mensaje: 'Error al crear cupón',
        detalle: error.message
      });
    }
  },

  // PUT /api/cupones/:id
  update: async (req, res) => {
    try {
      const cupon = await Cupon.findByPk(req.params.id);

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado'
        });
      }

      await cupon.update(req.body);

      res.json({
        mensaje: 'Cupón actualizado correctamente',
        cupon: {
          ...cupon.toJSON(),
          id_cupon: cupon.id
        }
      });
    } catch (error) {
      res.status(400).json({
        mensaje: 'Error al actualizar cupón',
        detalle: error.message
      });
    }
  },

  // POST /api/cupones/:id/usar
  registrarUso: async (req, res) => {
    try {
      const cupon = await Cupon.findByPk(req.params.id);

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado'
        });
      }

      if (!cupon.esValido()) {
        return res.status(400).json({
          mensaje: 'El cupón no es válido',
          valido: false,
          usos_restantes: cupon.limite_stock - cupon.usos_actuales
        });
      }

      cupon.usos_actuales += 1;
      await cupon.save();

      res.json({
        mensaje: 'Uso de cupón registrado correctamente',
        cupon: {
          id_cupon: cupon.id,
          usos_actuales: cupon.usos_actuales,
          usos_restantes: cupon.limite_stock - cupon.usos_actuales
        }
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al registrar uso del cupón',
        detalle: error.message
      });
    }
  },

  // DELETE /api/cupones/:id
  remove: async (req, res) => {
    try {
      const cupon = await Cupon.findByPk(req.params.id);

      if (!cupon) {
        return res.status(404).json({
          mensaje: 'Cupón no encontrado'
        });
      }

      await cupon.destroy();

      res.json({
        mensaje: 'Cupón eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al eliminar cupón',
        detalle: error.message
      });
    }
  }
};

module.exports = cuponController;