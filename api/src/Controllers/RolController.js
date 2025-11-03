const Rol = require('../Models/Rol');

module.exports = {
    async createRole(req, res) {
        try {
            const { nombre } = req.body;
            const rol = await Rol.create({ nombre });
            res.status(201).json(rol);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllRoles(req, res) {
        try {
            const roles = await Rol.findAll();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getRoleById(req, res) {
        try {
            const role = await Rol.findByPk(req.params.id);
            if (!role) {
                return res.status(404).json({ error: 'Rol no encontrado o inexistente.' });
            }
            res.status(200).json(role);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateRole(req, res) {
        try {
            const [updated] = await Role.update(req.body, {
                where: { id_rol: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Role no encontrado' });
            }
            res.status(200).json({ message: 'Rol actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteRole(req, res) {
        try {
            const deleted = await Rol.destroy({ 
                where: { id_rol: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }
            res.status(200).json({ message: 'Rol eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};