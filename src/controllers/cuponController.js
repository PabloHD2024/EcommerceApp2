const cuponesDB = require('../data/cuponData');
const Cupon = require('../models/Cupon');

const cuponController = {
    // GET /api/cupones - Obtener todos los cupones
    getAll: (req, res) => {
        res.json(cuponesDB);
    },

    // GET /api/cupones/:id - Obtener un cupón por ID
    getById: (req, res) => {
        const id = parseInt(req.params.id);
        const cupon = cuponesDB.find(c => c.id_cupon === id);

        if (!cupon) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado"
            });
        }

        // Devolver también si es válido
        const cuponObj = new Cupon(cupon.id_cupon, cupon.descuento, cupon.fecha_vencimiento, cupon.limite_stock);
        cuponObj.usos_actuales = cupon.usos_actuales;
        cuponObj.activo = cupon.activo;
        
        res.json({
            ...cupon,
            es_valido: cuponObj.esValido()
        });
    },

    // GET /api/cupones/validar/:codigo - Validar un cupón (por ID)
    validar: (req, res) => {
        const id = parseInt(req.params.codigo);
        const cuponData = cuponesDB.find(c => c.id_cupon === id);

        if (!cuponData) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado",
                valido: false
            });
        }

        const cupon = new Cupon(cuponData.id_cupon, cuponData.descuento, cuponData.fecha_vencimiento, cuponData.limite_stock);
        cupon.usos_actuales = cuponData.usos_actuales;
        cupon.activo = cuponData.activo;

        const valido = cupon.esValido();

        res.json({
            id_cupon: cuponData.id_cupon,
            descuento: cuponData.descuento,
            valido: valido,
            mensaje: valido ? "Cupón válido" : "Cupón no válido (vencido, agotado o inactivo)"
        });
    },

    // GET /api/cupones/aplicar/:codigo?monto=100 - Aplicar descuento
    aplicar: (req, res) => {
        const id = parseInt(req.params.codigo);
        const monto = parseFloat(req.query.monto);

        if (!monto || monto <= 0) {
            return res.status(400).json({
                mensaje: "El parámetro 'monto' es requerido y debe ser mayor a 0"
            });
        }

        const cuponData = cuponesDB.find(c => c.id_cupon === id);

        if (!cuponData) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado"
            });
        }

        const cupon = new Cupon(cuponData.id_cupon, cuponData.descuento, cuponData.fecha_vencimiento, cuponData.limite_stock);
        cupon.usos_actuales = cuponData.usos_actuales;
        cupon.activo = cuponData.activo;

        if (!cupon.esValido()) {
            return res.status(400).json({
                mensaje: "El cupón no es válido",
                valido: false
            });
        }

        const montoConDescuento = cupon.aplicarDescuento(monto);
        const ahorro = monto - montoConDescuento;

        res.json({
            id_cupon: cuponData.id_cupon,
            descuento: cuponData.descuento,
            monto_original: monto,
            monto_final: montoConDescuento,
            ahorro: ahorro,
            mensaje: `¡Cupón aplicado! Ahorraste $${ahorro.toFixed(2)}`
        });
    },

    // POST /api/cupones - Crear un nuevo cupón
    create: (req, res) => {
        const nuevoCupon = req.body;

        if (!nuevoCupon.descuento || !nuevoCupon.fecha_vencimiento || !nuevoCupon.limite_stock) {
            return res.status(400).json({
                mensaje: "Los campos descuento, fecha_vencimiento y limite_stock son obligatorios"
            });
        }

        if (nuevoCupon.descuento <= 0 || nuevoCupon.descuento > 100) {
            return res.status(400).json({
                mensaje: "El descuento debe ser un número entre 1 y 100"
            });
        }

        const nuevoId = cuponesDB.length > 0
            ? cuponesDB[cuponesDB.length - 1].id_cupon + 1
            : 1;

        const cuponCreado = {
            id_cupon: nuevoId,
            descuento: nuevoCupon.descuento,
            fecha_vencimiento: nuevoCupon.fecha_vencimiento,
            limite_stock: nuevoCupon.limite_stock,
            usos_actuales: 0,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        cuponesDB.push(cuponCreado);

        res.status(201).json({
            mensaje: "Cupón creado correctamente",
            cupon: cuponCreado
        });
    },

    // PUT /api/cupones/:id - Actualizar un cupón
    update: (req, res) => {
        const id = parseInt(req.params.id);
        const datosActualizados = req.body;

        const cupon = cuponesDB.find(c => c.id_cupon === id);

        if (!cupon) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado"
            });
        }

        if (datosActualizados.descuento !== undefined) {
            if (datosActualizados.descuento <= 0 || datosActualizados.descuento > 100) {
                return res.status(400).json({
                    mensaje: "El descuento debe ser un número entre 1 y 100"
                });
            }
            cupon.descuento = datosActualizados.descuento;
        }

        if (datosActualizados.fecha_vencimiento !== undefined) {
            cupon.fecha_vencimiento = datosActualizados.fecha_vencimiento;
        }

        if (datosActualizados.limite_stock !== undefined) {
            cupon.limite_stock = datosActualizados.limite_stock;
        }

        if (datosActualizados.activo !== undefined) {
            cupon.activo = datosActualizados.activo;
        }

        cupon.updated_at = new Date().toISOString();

        res.json({
            mensaje: "Cupón actualizado correctamente",
            cupon: cupon
        });
    },

    // POST /api/cupones/:id/usar - Registrar un uso del cupón
    registrarUso: (req, res) => {
        const id = parseInt(req.params.id);
        const cuponData = cuponesDB.find(c => c.id_cupon === id);

        if (!cuponData) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado"
            });
        }

        const cupon = new Cupon(cuponData.id_cupon, cuponData.descuento, cuponData.fecha_vencimiento, cuponData.limite_stock);
        cupon.usos_actuales = cuponData.usos_actuales;
        cupon.activo = cuponData.activo;

        if (!cupon.esValido()) {
            return res.status(400).json({
                mensaje: "El cupón no es válido",
                valido: false,
                usos_restantes: cuponData.limite_stock - cuponData.usos_actuales
            });
        }

        cuponData.usos_actuales++;
        cuponData.updated_at = new Date().toISOString();

        res.json({
            mensaje: "Uso de cupón registrado correctamente",
            cupon: {
                id_cupon: cuponData.id_cupon,
                usos_actuales: cuponData.usos_actuales,
                usos_restantes: cuponData.limite_stock - cuponData.usos_actuales
            }
        });
    },

    // DELETE /api/cupones/:id - Eliminar un cupón
    remove: (req, res) => {
        const id = parseInt(req.params.id);
        const indiceCupon = cuponesDB.findIndex(c => c.id_cupon === id);

        if (indiceCupon === -1) {
            return res.status(404).json({
                mensaje: "Cupón no encontrado"
            });
        }

        cuponesDB.splice(indiceCupon, 1);

        res.json({
            mensaje: "Cupón eliminado correctamente"
        });
    }
};

module.exports = cuponController;