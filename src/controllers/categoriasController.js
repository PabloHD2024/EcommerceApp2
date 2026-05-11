const categoriasDB = require('../data/categoriasData');

const validarId = (id) => {
    return Number.isInteger(id) && id > 0;
};

const validarTexto = (valor) => {
    return typeof valor === 'string' && valor.trim().length > 0;
};

const existeCategoriaConNombre = (nombre, idActual = null) => {
    return categoriasDB.some(cat =>
        cat.nombre.toLowerCase() === nombre.trim().toLowerCase() &&
        cat.id !== idActual
    );
};

const categoriasController = {
    getAll: (req, res) => {
        res.json(categoriasDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id de la categoría debe ser un número entero positivo"
            });
        }

        const categoria = categoriasDB.find(cat => cat.id === id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada"
            });
        }

        res.json(categoria);
    },

    create: (req, res) => {
        const nuevaCategoria = req.body;

        if (!validarTexto(nuevaCategoria.nombre)) {
            return res.status(400).json({
                mensaje: "El nombre de la categoría es obligatorio"
            });
        }

        if (existeCategoriaConNombre(nuevaCategoria.nombre)) {
            return res.status(400).json({
                mensaje: "Ya existe una categoría con ese nombre"
            });
        }

        const nuevoId = categoriasDB.length > 0
            ? Math.max(...categoriasDB.map(cat => cat.id)) + 1
            : 1;

        const categoriaCreada = {
            id: nuevoId,
            nombre: nuevaCategoria.nombre.trim()
        };

        categoriasDB.push(categoriaCreada);

        res.status(201).json({
            mensaje: "Categoría creada correctamente",
            categoria: categoriaCreada
        });
    },

    update: (req, res) => {
        const id = parseInt(req.params.id);
        const datosActualizados = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id de la categoría debe ser un número entero positivo"
            });
        }

        const categoria = categoriasDB.find(cat => cat.id === id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada"
            });
        }

        if (datosActualizados.nombre !== undefined) {
            if (!validarTexto(datosActualizados.nombre)) {
                return res.status(400).json({
                    mensaje: "El nombre de la categoría no puede estar vacío"
                });
            }

            if (existeCategoriaConNombre(datosActualizados.nombre, id)) {
                return res.status(400).json({
                    mensaje: "Ya existe una categoría con ese nombre"
                });
            }

            categoria.nombre = datosActualizados.nombre.trim();
        }

        res.json({
            mensaje: "Categoría actualizada correctamente",
            categoria: categoria
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

        if (!validarId(id)) {
            return res.status(400).json({
                mensaje: "El id de la categoría debe ser un número entero positivo"
            });
        }

        const indiceCategoria = categoriasDB.findIndex(cat => cat.id === id);

        if (indiceCategoria === -1) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada"
            });
        }

        categoriasDB.splice(indiceCategoria, 1);

        res.json({
            mensaje: "Categoría eliminada correctamente"
        });
    }
};

module.exports = categoriasController;