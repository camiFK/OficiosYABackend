const { Usuario } = require('../Models/Index');

module.exports = {
    async createUser(req, res) {
        try {
            const user = await Usuario.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await Usuario.findAll();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await Usuario.findByPk(req.params.id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateUser(req, res) {
        try {
            const [updated] = await Usuario.update(req.body, {
                where: { id_usuario: req.params.id }
            });
            if (updated) {
                res.status(200).json({ message: 'Usuario actualizado correctamente' });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteUser(req, res) {
        try {
            const deleted = await Usuario.destroy({
                where: { id_usuario: req.params.id }
            });
            if (deleted) {
                res.status(200).json({ message: 'Usuario eliminado correctamente' });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

 };