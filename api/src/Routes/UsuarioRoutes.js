const controllers = require('../Controllers/UsuarioController.js');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión y administración de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios encontrados
 */
router.get('/', verifyToken, requireRole('Administrador'), controllers.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por id
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No existe
 */
router.get('/:id', verifyToken, controllers.getUserById);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Crea un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena, id_rol]
 *             properties:
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               id_rol:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/create', verifyToken, requireRole('Administrador'), ValidationMiddleware.validateRequired(['correo', 'contrasena', 'id_rol']), controllers.createUser);

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Actualiza un usuario
 *     tags: [Usuarios]
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
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/update/:id', verifyToken, requireRole('Administrador'), ValidationMiddleware.validateRequired(['correo']), controllers.updateUser);

/**
 * @swagger
 * /api/users/historial/moderacion:
 *   get:
 *     summary: Historial de moderación
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial listado
 */
router.get('/historial/moderacion', verifyToken, requireRole('Administrador'), controllers.getHistorialModeracion);

/**
 * @swagger
 * /api/users/update-status/{id}:
 *   put:
 *     summary: Actualiza el estado de un usuario
 *     tags: [Usuarios]
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
router.put('/update-status/:id', verifyToken, requireRole('Administrador'), controllers.updateUserStatus);

/**
 * @swagger
 * /api/users/historial/moderacion:
 *   delete:
 *     summary: Limpia el historial de moderación
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial limpiado
 */
router.delete('/historial/moderacion', verifyToken, requireRole('Administrador'), controllers.clearHistorialModeracion);

module.exports = router;
