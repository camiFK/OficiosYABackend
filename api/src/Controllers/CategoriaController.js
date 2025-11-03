const {Categoria} = require('../Models/Index');

module.exports = {
    async createCategoria (req, res) {
        try {
            if (!req.body.nombre || !req.body.descripcion) {
                return res.status(400).json({error: "Los campos 'nombre' y 'descripcion' son requeridos"});
            }
            const categoria = await Categoria.create(req.body);
            res.status(201).json(categoria);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    async getAllCategorias (req, res) {
        try {
            const categorias = await Categoria.findAll();
            res.status(200).json(categorias);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    async getCategoriaById (req, res) {
        try {
            const categoria = await Categoria.findByPk(req.params.id);
            if (categoria) {
                res.status(200).json(categoria);
            } else {
                res.status(404).json({error: 'Categoria no encontrada'});
            }
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    async updateCategoria (req, res) {
        try {
            const [updated] = await Categoria.update(req.body, {
                where: { id_categoria: req.params.id }
            });
            if (updated) {
                const updatedCategoria = await Categoria.findByPk(req.params.id);
                res.status(200).json(updatedCategoria);
            } else {
                res.status(404).json({error: 'Categoria no encontrada'});
            }
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    },

    async deleteCategoria (req, res) {
        try {
            const deleted = await Categoria.destroy({
                where: { id_categoria: req.params.id }
            });
            if (deleted) {
                res.status(200).json({message: 'Categoria eliminada exitosamente'});
            } else {
                res.status(404).json({error: 'Categoria no encontrada'});
            }
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
};