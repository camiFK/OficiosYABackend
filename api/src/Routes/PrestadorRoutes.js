const express = require('express');
const router = express.Router();
const controller = require('../Controllers/PrestadorController');
const calificacionController = require('../Controllers/CalificacionController');
const imageMiddleware = require('../Middlewares/imageMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Prestadores
 *   description: Gestión de prestadores y sus solicitudes
 */

// Rutas generales de prestadores
/**
 * @swagger
 * /api/prestadores:
 *   get:
 *     summary: Lista prestadores
 *     tags: [Prestadores]
 *     responses:
 *       200:
 *         description: Prestadores disponibles
 */
router.get('/', controller.getAllPrestadores);

/**
 * @swagger
 * /api/prestadores/{id}:
 *   get:
 *     summary: Obtiene un prestador
 *     tags: [Prestadores]
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
 *         description: Prestador encontrado
 *       404:
 *         description: No existe
 */
router.get('/:id', authMiddleware.verifyToken, controller.getPrestadorById);

/**
 * @swagger
 * /api/prestadores/update/{id}:
 *   put:
 *     summary: Actualiza datos del prestador
 *     tags: [Prestadores]
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
 *             description: Campos del prestador a actualizar
 *     responses:
 *       200:
 *         description: Prestador actualizado
 */
router.put('/update/:id', authMiddleware.verifyToken, controller.updatePrestador);

/**
 * @swagger
 * /api/prestadores/{id}/categorias:
 *   put:
 *     summary: Actualiza categorías del prestador
 *     tags: [Prestadores]
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
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Categorías actualizadas
 */
router.put('/:id/categorias', authMiddleware.verifyToken, controller.updateCategorias);

/**
 * @swagger
 * /api/prestadores/{id}/solicitudes:
 *   get:
 *     summary: Solicitudes asignadas al prestador
 *     tags: [Prestadores]
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
 *         description: Listado de solicitudes
 */
router.get('/:id/solicitudes', authMiddleware.verifyToken, controller.getSolicitudesByPrestadorId);

/**
 * @swagger
 * /api/prestadores/{id}/promedio-calificaciones:
 *   get:
 *     summary: Promedio de calificaciones del prestador
 *     tags: [Prestadores]
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
 *         description: Promedio calculado
 */
router.get('/:id/promedio-calificaciones', 
    authMiddleware.verifyToken,
    ValidationMiddleware.validatePositiveInteger('id'),
    ErrorHandler.asyncHandler(calificacionController.getPromedioCalificaciones)
);

// Rutas de imágenes de prestadores
// Nota: Las rutas de imágenes se manejan en ImageRoutes.js
// router.post('/images', 
//     authMiddleware.verifyToken,
//     imageMiddleware.uploadSingle('image'),
//     imageMiddleware.logUploadedFiles,
//     controller.uploadPrestadorImage
// );

// router.post('/:id/imagenes', 
//     authMiddleware.verifyToken,
//     imageMiddleware.uploadSingle('imagen'),
//     imageMiddleware.logUploadedFiles,
//     controller.saveImage
// );

// router.delete('/images/:id', authMiddleware.verifyToken, controller.deletePrestadorImage);

// router.put('/images/:id', authMiddleware.verifyToken, controller.updatePrestadorImage);

// router.get('/:id/images',  controller.getPrestadorImages);

/**
 * @swagger
 * /api/prestadores/presupuestos/enviados:
 *   post:
 *     summary: Presupuestos enviados por el prestador autenticado
 *     tags: [Prestadores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Presupuestos enviados
 */
router.post('/presupuestos/enviados', authMiddleware.verifyToken, controller.getPresupuestosEnviados);

/**
 * @swagger
 * /api/prestadores/solicitudes/rechazar:
 *   post:
 *     summary: Rechaza una solicitud
 *     tags: [Prestadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_solicitud:
 *                 type: integer
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud rechazada
 */
router.post('/solicitudes/rechazar', authMiddleware.verifyToken, controller.rejectSolicitud);

module.exports = router;