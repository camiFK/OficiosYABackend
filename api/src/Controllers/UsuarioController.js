const { Usuario } = require('../Models/Index');
const bcrypt = require('bcrypt');

module.exports = {
  async createUser(req, res) {
    try {
      const { contrasena, ...rest } = req.body;

      if (!contrasena || typeof contrasena !== 'string' || contrasena.trim() === '') {
        return res.status(400).json({ error: "El campo 'contrasena' es requerido" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      const user = await Usuario.create({ ...rest, contrasena: hashedPassword });

      const userSafe = user.toJSON ? user.toJSON() : { ...user };
      delete userSafe.contrasena;

      res.status(201).json(userSafe);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await Usuario.findAll();
      const sanitized = users.map(u => {
        const obj = u.toJSON ? u.toJSON() : { ...u };
        delete obj.contrasena;
        return obj;
      });
      res.status(200).json(sanitized);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await Usuario.findByPk(req.params.id);
      if (user) {
        const obj = user.toJSON ? user.toJSON() : { ...user };
        delete obj.contrasena;
        res.status(200).json(obj);
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
        return res.status(200).json({ message: 'Usuario actualizado' });
      } else {
        return res.status(404).json({ message: 'Usuario no encontrado' });
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
        return res.status(200).json({ message: 'Usuario eliminado' });
      } else {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};