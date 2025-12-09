const controllers = require('../Controllers/RolController.js');
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Administración de roles de usuario
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lista todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles disponibles
 */
router.get('/', verifyToken, requireRole('Administrador'), controllers.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtiene un rol por id
 *     tags: [Roles]
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
 *         description: Rol encontrado
 *       404:
 *         description: Rol no existe
 */
router.get('/:id', verifyToken, requireRole('Administrador'), controllers.getRoleById);

/**
 * @swagger
 * /api/roles/create:
 *   post:
 *     summary: Crea un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rol creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/create', verifyToken, requireRole('Administrador'), controllers.createRole);

/**
 * @swagger
 * /api/roles/update/{id}:
 *   put:
 *     summary: Actualiza un rol
 *     tags: [Roles]
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
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       404:
 *         description: Rol no existe
 */
router.put('/update/:id', verifyToken, requireRole('Administrador'), controllers.updateRole);

/**
 * @swagger
 * /api/roles/delete/{id}:
 *   delete:
 *     summary: Elimina un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Rol eliminado
 *       404:
 *         description: Rol no existe
 */
router.delete('/delete/:id', verifyToken, requireRole('Administrador'), controllers.deleteRole);

module.exports = router;