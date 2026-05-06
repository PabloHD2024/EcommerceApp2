const categoriasDB = require('../data/categoriasData');

const categoriasController = {
    getAll: (req, res) => {
        res.json(categoriasDB);
    },

    getById: (req, res) => {
        const id = parseInt(req.params.id);

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

        if (!nuevaCategoria.nombre) {
            return res.status(400).json({
                mensaje: "El nombre de la categoría es obligatorio"
            });
        }

        const nuevoId = categoriasDB.length > 0
            ? categoriasDB[categoriasDB.length - 1].id + 1
            : 1;

        const categoriaCreada = {
            id: nuevoId,
            nombre: nuevaCategoria.nombre
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

        const categoria = categoriasDB.find(cat => cat.id === id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada"
            });
        }

        categoria.nombre = datosActualizados.nombre || categoria.nombre;

        res.json({
            mensaje: "Categoría actualizada correctamente",
            categoria: categoria
        });
    },

    remove: (req, res) => {
        const id = parseInt(req.params.id);

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