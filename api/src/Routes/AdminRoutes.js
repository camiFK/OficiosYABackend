const express = require('express');
const router = express.Router();
const AdminController = require('../Controllers/AdminController');
const UsuarioController = require('../Controllers/UsuarioController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

// Middleware global: Protege TODAS las rutas de este archivo
router.use(verifyToken, requireRole('Administrador'));

// Estadísticas
router.get('/stats/registros', AdminController.getRegistroStats);

// Moderación de Usuarios
// Reutilizamos la lógica de UsuarioController
router.get('/historial/moderacion', UsuarioController.getHistorialModeracion);
router.put('/update-status/:id', UsuarioController.updateUserStatus);

module.exports = router;