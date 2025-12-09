const express = require('express');
const router = express.Router();

const CalificacionController = require('../Controllers/CalificacionController');
const { verifyToken } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Registro y consulta de calificaciones de prestadores
 */

// POST /api/calificaciones: Registra la calificación de un prestador
/**
 * @swagger
 * /api/calificaciones:
 *   post:
 *     summary: Crea una calificación para un prestador
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estrellas, id_solicitud, id_prestador]
 *             properties:
 *               estrellas:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               id_solicitud:
 *                 type: integer
 *               id_prestador:
 *                 type: integer
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Calificación creada
 */
router.post('/',
    verifyToken,
    ValidationMiddleware.validateRequired(['estrellas', 'id_solicitud', 'id_prestador']),
    ErrorHandler.asyncHandler(CalificacionController.crearCalificacion)
);

// GET /api/calificaciones/prestador/:id: Devuelve todas las calificaciones de un prestador
/**
 * @swagger
 * /api/calificaciones/prestador/{id}:
 *   get:
 *     summary: Calificaciones de un prestador
 *     tags: [Calificaciones]
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
 *         description: Listado de calificaciones
 */
router.get('/prestador/:id',
    verifyToken,
    ValidationMiddleware.validatePositiveInteger('id'),
    ErrorHandler.asyncHandler(CalificacionController.getCalificacionesByPrestador)
);

module.exports = router;