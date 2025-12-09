const controllers = require('../Controllers/CategoriaController.js');
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gestión de categorías de servicios
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Lista todas las categorías
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Categorías disponibles
 */
router.get('/', controllers.getAllCategorias);

/**
 * @swagger
 * /api/categorias/{id}:
 *   get:
 *     summary: Obtiene una categoría
 *     tags: [Categorias]
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
 *         description: Categoría encontrada
 *       404:
 *         description: No existe
 */
router.get('/:id', verifyToken, controllers.getCategoriaById);

/**
 * @swagger
 * /api/categorias/{id}/prestadores:
 *   get:
 *     summary: Prestadores asociados a la categoría
 *     tags: [Categorias]
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
 *         description: Listado de prestadores
 */
router.get('/:id/prestadores', verifyToken, controllers.getPrestadoresByCategoria);

/**
 * @swagger
 * /api/categorias/create:
 *   post:
 *     summary: Crea una categoría
 *     tags: [Categorias]
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
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/create', verifyToken, requireRole('Administrador'), controllers.createCategoria);

/**
 * @swagger
 * /api/categorias/update/{id}:
 *   put:
 *     summary: Actualiza una categoría
 *     tags: [Categorias]
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
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/update/:id', verifyToken, requireRole('Administrador'), controllers.updateCategoria);

/**
 * @swagger
 * /api/categorias/delete/{id}:
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categorias]
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
 *         description: Categoría eliminada
 */
router.delete('/delete/:id', verifyToken, requireRole('Administrador'), controllers.deleteCategoria);

module.exports = router;