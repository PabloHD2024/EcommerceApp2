const clientesDB = require('../data/clientesData');

const validarId = (id) => {
    return Number.isInteger(id) && id > 0;
};

const validarTexto = (valor) => {
    return typeof valor === 'string' && valor.trim().length > 0;
};

const validarEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validarTexto(email) && regexEmail.test(email.trim());
};

const existeEmail = (email, idActual = null) => {
    return clientesDB.some(cliente =>
        cliente.email.toLowerCase() === email.trim().toLowerCase() &&
        cliente.id_cliente !== idActual
    );
};

const clientesController = {
    getAll: (req, res) => {
        res.json(clientesDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del cliente debe ser un número entero positivo"
            });
        }

        const cliente = clientesDB.find(cliente => cliente.id_cliente === id);

        if (!cliente) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.json(cliente);
    },

    create: (req, res) => {
        const nuevoCliente = req.body;

        if (!validarTexto(nuevoCliente.nombre)) {
            return res.status(400).json({
                mensaje: "El nombre del cliente es obligatorio"
            });
        }

        if (!validarEmail(nuevoCliente.email)) {
            return res.status(400).json({
                mensaje: "El email del cliente es obligatorio y debe tener un formato válido"
            });
        }

        if (existeEmail(nuevoCliente.email)) {
            return res.status(400).json({
                mensaje: "Ya existe un cliente con ese email"
            });
        }

        if (nuevoCliente.telefono !== undefined && nuevoCliente.telefono !== null && !validarTexto(nuevoCliente.telefono)) {
            return res.status(400).json({
                mensaje: "El teléfono del cliente no puede estar vacío"
            });
        }

        if (nuevoCliente.direccion !== undefined && nuevoCliente.direccion !== null && !validarTexto(nuevoCliente.direccion)) {
            return res.status(400).json({
                mensaje: "La dirección del cliente no puede estar vacía"
            });
        }

        const nuevoId = clientesDB.length > 0
            ? Math.max(...clientesDB.map(cliente => cliente.id_cliente)) + 1
            : 1;

        const fechaActual = new Date().toISOString();

        const clienteCreado = {
            id_cliente: nuevoId,
            nombre: nuevoCliente.nombre.trim(),
            email: nuevoCliente.email.trim().toLowerCase(),
            telefono: nuevoCliente.telefono ? nuevoCliente.telefono.trim() : "",
            direccion: nuevoCliente.direccion ? nuevoCliente.direccion.trim() : "",
            created_at: fechaActual,
            updated_at: fechaActual
        };

        clientesDB.push(clienteCreado);

        res.status(201).json({
            mensaje: "Cliente creado correctamente",
            cliente: clienteCreado
        });
    },

    update: (req, res) => {
        const id = parseInt(req.params.id);
        const datosActualizados = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del cliente debe ser un número entero positivo"
            });
        }

        const cliente = clientesDB.find(cliente => cliente.id_cliente === id);

        if (!cliente) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        if (datosActualizados.nombre !== undefined) {
            if (!validarTexto(datosActualizados.nombre)) {
                return res.status(400).json({
                    mensaje: "El nombre del cliente no puede estar vacío"
                });
            }

            cliente.nombre = datosActualizados.nombre.trim();
        }

        if (datosActualizados.email !== undefined) {
            if (!validarEmail(datosActualizados.email)) {
                return res.status(400).json({
                    mensaje: "El email del cliente debe tener un formato válido"
                });
            }

            if (existeEmail(datosActualizados.email, id)) {
                return res.status(400).json({
                    mensaje: "Ya existe un cliente con ese email"
                });
            }

            cliente.email = datosActualizados.email.trim().toLowerCase();
        }

        if (datosActualizados.telefono !== undefined) {
            if (datosActualizados.telefono !== null && !validarTexto(datosActualizados.telefono)) {
                return res.status(400).json({
                    mensaje: "El teléfono del cliente no puede estar vacío"
                });
            }

            cliente.telefono = datosActualizados.telefono ? datosActualizados.telefono.trim() : "";
        }

        if (datosActualizados.direccion !== undefined) {
            if (datosActualizados.direccion !== null && !validarTexto(datosActualizados.direccion)) {
                return res.status(400).json({
                    mensaje: "La dirección del cliente no puede estar vacía"
                });
            }

            cliente.direccion = datosActualizados.direccion ? datosActualizados.direccion.trim() : "";
        }

        cliente.updated_at = new Date().toISOString();

        res.json({
            mensaje: "Cliente actualizado correctamente",
            cliente: cliente
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id del cliente debe ser un número entero positivo"
            });
        }

        const indiceCliente = clientesDB.findIndex(cliente => cliente.id_cliente === id);

        if (indiceCliente === -1) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        clientesDB.splice(indiceCliente, 1);

        res.json({
            mensaje: "Cliente eliminado correctamente"
        });
    }
};

module.exports = clientesController;