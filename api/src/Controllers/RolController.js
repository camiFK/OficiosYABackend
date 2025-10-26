const Rol = require('../Models/Rol');

module.exports = {
    async createRol(req, res) {
        try {
            const { nombre } = req.body;
            const rol = await Rol.create({ nombre });
            res.status(201).json(rol);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllRols(req, res) {
        try {
            const rols = await Rol.findAll();
            res.status(200).json(rols);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getRolById(req, res) {
        try {
            const rol = await Rol.findByPk(req.params.id);
            if (!rol) {
                return res.status(404).json({ error: 'Rol not found' });
            }
            res.status(200).json(rol);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateRol(req, res) {
        try {
            const [updated] = await Rol.update(req.body, {
                where: { id_rol: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Rol not found' });
            }
            res.status(200).json({ message: 'Rol updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteRol(req, res) {
        try {
            const deleted = await Rol.destroy({ 
                where: { id_rol: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Rol not found' });
            }   
            res.status(200).json({ message: 'Rol deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};