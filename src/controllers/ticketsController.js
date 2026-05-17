const ticketsDB = require('../data/ticketsData');

// validaciones
const validarId = (id) => {
    return Number.isInteger(id) && id > 0;
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


// controller
const ticketsController = {
    getAll: (req, res) => {
        res.json(ticketsDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del ticket debe ser un número entero positivo"
            });
        }

        const ticket = ticketsDB.find(ticket => ticket.id_ticket === id);

        if (!ticket) {
            return res.status(404).json({
                mensaje: "Ticket no encontrado"
            });
        }

        res.json(ticket);
    },

    create: (req, res) => {
        const nuevoTicket = req.body;

        if (!validarId(nuevoTicket.id_pedido)) {
            return res.status(400).json({
                mensaje: "El id del pedido es obligatorio y debe ser un número entero positivo"
            });
        }

        if (!validarTipoFactura(nuevoTicket.tipo_factura)) {
            return res.status(400).json({
                mensaje: "El tipo de factura es obligatorio y debe ser A, B o C"
            });
        }

        if (!validarTotal(nuevoTicket.total)) {
            return res.status(400).json({
                mensaje: "El total del ticket debe ser un número mayor o igual a 0"
            });
        }

        if (!validarTexto(nuevoTicket.CAE)) {
            return res.status(400).json({
                mensaje: "El CAE del ticket es obligatorio"
            });
        }

        const nuevoId = ticketsDB.length > 0
            ? Math.max(...ticketsDB.map(ticket => ticket.id_ticket)) + 1
            : 1;

        const fechaActual = new Date().toISOString();

        const ticketCreado = {
            id_ticket: nuevoId,
            id_pedido: nuevoTicket.id_pedido,
            fecha_emision: fechaActual,
            tipo_factura: nuevoTicket.tipo_factura.toUpperCase(),
            total: nuevoTicket.total,
            CAE: nuevoTicket.CAE.trim(),
            created_at: fechaActual,
            updated_at: fechaActual
        };

        ticketsDB.push(ticketCreado);

        res.status(201).json({
            mensaje: "Ticket creado correctamente",
            ticket: ticketCreado
        });
    },

    update: (req, res) => {
        const id = parseInt(req.params.id);
        const datosActualizados = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del ticket debe ser un número entero positivo"
            });
        }

        const ticket = ticketsDB.find(ticket => ticket.id_ticket === id);

        if (!ticket) {
            return res.status(404).json({
                mensaje: "Ticket no encontrado"
            });
        }

        if (datosActualizados.id_pedido !== undefined) {
            if (!validarId(datosActualizados.id_pedido)) {
                return res.status(400).json({
                    mensaje: "El id del pedido debe ser un número entero positivo"
                });
            }

            ticket.id_pedido = datosActualizados.id_pedido;
        }

        if (datosActualizados.tipo_factura !== undefined) {
            if (!validarTipoFactura(datosActualizados.tipo_factura)) {
                return res.status(400).json({
                    mensaje: "El tipo de factura debe ser A, B o C"
                });
            }

            ticket.tipo_factura = datosActualizados.tipo_factura.toUpperCase();
        }

        if (datosActualizados.total !== undefined) {
            if (!validarTotal(datosActualizados.total)) {
                return res.status(400).json({
                    mensaje: "El total del ticket debe ser un número mayor o igual a 0"
                });
            }

            ticket.total = datosActualizados.total;
        }

        if (datosActualizados.CAE !== undefined) {
            if (!validarTexto(datosActualizados.CAE)) {
                return res.status(400).json({
                    mensaje: "El CAE del ticket no puede estar vacío"
                });
            }

            ticket.CAE = datosActualizados.CAE.trim();
        }

        ticket.updated_at = new Date().toISOString();

        res.json({
            mensaje: "Ticket actualizado correctamente",
            ticket: ticket
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del ticket debe ser un número entero positivo"
            });
        }

        const indiceTicket = ticketsDB.findIndex(ticket => ticket.id_ticket === id);

        if (indiceTicket === -1) {
            return res.status(404).json({
                mensaje: "Ticket no encontrado"
            });
        }

        ticketsDB.splice(indiceTicket, 1);

        res.json({
            mensaje: "Ticket eliminado correctamente"
        });
    }
};

module.exports = ticketsController;