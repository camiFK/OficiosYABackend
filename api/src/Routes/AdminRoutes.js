const express = require('express');
const router = express.Router();
const AdminController = require('../Controllers/AdminController');
const UsuarioController = require('../Controllers/UsuarioController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

// Middleware global: Protege TODAS las rutas de este archivo
router.use(verifyToken, requireRole('Administrador'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Rutas administrativas y de moderación
 */

// Estadísticas
/**
 * @swagger
 * /api/admin/stats/registros:
 *   get:
 *     summary: Estadísticas de registros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de registros
 */
router.get('/stats/registros', AdminController.getRegistroStats);

// Moderación de Usuarios
// Reutilizamos la lógica de UsuarioController
/**
 * @swagger
 * /api/admin/historial/moderacion:
 *   get:
 *     summary: Historial de moderación
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de acciones de moderación
 */
router.get('/historial/moderacion', UsuarioController.getHistorialModeracion);

/**
 * @swagger
 * /api/admin/update-status/{id}:
 *   put:
 *     summary: Actualiza estado de usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.put('/update-status/:id', UsuarioController.updateUserStatus);

module.exports = router;