const express = require('express');
const router = express.Router();
const controller = require('../Controllers/ClienteController');
const { verifyToken } = require('../Middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Operaciones de solicitudes y presupuestos de clientes
 */

/**
 * @swagger
 * /api/clientes/{id}/solicitudes:
 *   get:
 *     summary: Solicitudes de un cliente
 *     tags: [Clientes]
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
 *         description: Lista de solicitudes
 */
router.get('/:id/solicitudes', verifyToken, controller.getSolicitudesByClienteId);

/**
 * @swagger
 * /api/clientes/{id}/solicitudes:
 *   post:
 *     summary: Crea una solicitud para un cliente
 *     tags: [Clientes]
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
 *             description: Datos de la solicitud
 *     responses:
 *       201:
 *         description: Solicitud creada
 */
router.post('/:id/solicitudes', verifyToken, controller.createClienteSolicitud);

/**
 * @swagger
 * /api/clientes/solicitudes/{id}:
 *   get:
 *     summary: Obtiene una solicitud
 *     tags: [Clientes]
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
 *         description: Solicitud encontrada
 */
router.get('/solicitudes/:id', verifyToken, controller.getSolicitudById);

/**
 * @swagger
 * /api/clientes/solicitudes/{id}:
 *   put:
 *     summary: Actualiza una solicitud
 *     tags: [Clientes]
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
 *         description: Solicitud actualizada
 */
router.put('/solicitudes/:id', verifyToken, controller.updateSolicitud);

/**
 * @swagger
 * /api/clientes/solicitudes/{id}/cancel:
 *   put:
 *     summary: Cancela una solicitud
 *     tags: [Clientes]
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
 *         description: Solicitud cancelada
 */
router.put('/solicitudes/:id/cancel', verifyToken, controller.cancelSolicitud);

/**
 * @swagger
 * /api/clientes/solicitudes/{id}/prestadores:
 *   get:
 *     summary: Prestadores para la solicitud por localidad
 *     tags: [Clientes]
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
router.get('/solicitudes/:id/prestadores', verifyToken, controller.obtenerPrestadoresPorLocalidad);

/**
 * @swagger
 * /api/clientes/solicitudes/{id}/prestadores-cercanos:
 *   get:
 *     summary: Prestadores cercanos a la solicitud
 *     tags: [Clientes]
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
 *         description: Prestadores cercanos
 */
router.get('/solicitudes/:id/prestadores-cercanos', verifyToken, controller.obtenerPrestadoresPorLocalidadCercana);

/**
 * @swagger
 * /api/clientes/presupuesto/{id}/aceptar:
 *   put:
 *     summary: Acepta un presupuesto
 *     tags: [Clientes]
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
 *         description: Presupuesto aceptado
 */
router.put('/presupuesto/:id/aceptar', verifyToken, controller.acceptPresupuesto);

/**
 * @swagger
 * /api/clientes/presupuesto/{id}/rechazar:
 *   put:
 *     summary: Rechaza un presupuesto
 *     tags: [Clientes]
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
 *         description: Presupuesto rechazado
 */
router.put('/presupuesto/:id/rechazar', verifyToken, controller.rejectPresupuesto);

module.exports = router;
