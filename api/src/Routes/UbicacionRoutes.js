const express = require('express');
const router = express.Router();
const controllers = require('../Controllers/UbicacionController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ubicaciones
 *   description: Catálogo de provincias y localidades
 */

/**
 * @swagger
 * /api/ubicaciones:
 *   get:
 *     summary: Lista todas las ubicaciones
 *     tags: [Ubicaciones]
 *     responses:
 *       200:
 *         description: Ubicaciones disponibles
 */
router.get('/', controllers.getAllUbicaciones);

/**
 * @swagger
 * /api/ubicaciones/provincias:
 *   get:
 *     summary: Lista provincias
 *     tags: [Ubicaciones]
 *     responses:
 *       200:
 *         description: Provincias disponibles
 */
router.get('/provincias', controllers.getProvincias);

/**
 * @swagger
 * /api/ubicaciones/{id}:
 *   get:
 *     summary: Obtiene ubicación por id
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ubicación encontrada
 *       404:
 *         description: No existe
 */
router.get('/:id', controllers.getUbicacionById);

/**
 * @swagger
 * /api/ubicaciones/localidad/{localidad}:
 *   get:
 *     summary: Busca localidad por nombre
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: localidad
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Localidad encontrada
 */
router.get('/localidad/:localidad', controllers.getLocalidadByName);

/**
 * @swagger
 * /api/ubicaciones/localidades/{provincia}:
 *   get:
 *     summary: Localidades por provincia
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: provincia
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Localidades de la provincia
 */
router.get('/localidades/:provincia', controllers.getLocalidadesByProvincia);

/**
 * @swagger
 * /api/ubicaciones:
 *   post:
 *     summary: Crea una ubicación
 *     tags: [Ubicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               localidad:
 *                 type: string
 *               provincia:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ubicación creada
 */
router.post('/', verifyToken, requireRole('Administrador'), controllers.createUbicacion);

module.exports = router;