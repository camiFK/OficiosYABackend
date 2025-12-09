const controllers = require('../Controllers/PresupuestoController.js');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Presupuestos
 *   description: Gestión de presupuestos entre clientes y prestadores
 */

/**
 * @swagger
 * /api/presupuestos/{id}:
 *   get:
 *     summary: Obtiene un presupuesto
 *     tags: [Presupuestos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Presupuesto encontrado
 */
router.get('/:id', controllers.getPresupuestoById);
// Prestador
/**
 * @swagger
 * /api/presupuestos/prestador/{id}:
 *   get:
 *     summary: Presupuestos creados por un prestador
 *     tags: [Presupuestos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Presupuestos listados
 */
router.get('/prestador/:id', controllers.getPresupuestoByPrestadorId);

/**
 * @swagger
 * /api/presupuestos/prestador/{id}/recibidos:
 *   get:
 *     summary: Solicitudes recibidas por un prestador
 *     tags: [Presupuestos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitudes recibidas
 */
router.get('/prestador/:id/recibidos', controllers.getSolicitudesByPrestadorId);

/**
 * @swagger
 * /api/presupuestos/prestador/{id}/enviar:
 *   post:
 *     summary: Envía un presupuesto a una solicitud
 *     tags: [Presupuestos]
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
 *             description: Datos del presupuesto
 *     responses:
 *       201:
 *         description: Presupuesto enviado
 */
router.post('/prestador/:id/enviar', controllers.sendPresupuesto);

/**
 * @swagger
 * /api/presupuestos/prestador/{id}/rechazar:
 *   post:
 *     summary: Rechaza una solicitud como prestador
 *     tags: [Presupuestos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitud rechazada
 */
router.post('/prestador/:id/rechazar', controllers.rejectSolicitud);

/**
 * @swagger
 * /api/presupuestos/prestador/{id}/aceptar:
 *   put:
 *     summary: Acepta una solicitud como prestador
 *     tags: [Presupuestos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitud aceptada
 */
router.put('/prestador/:id/aceptar', controllers.acceptSolicitud);
// Cliente
/**
 * @swagger
 * /api/presupuestos/{id}/rechazar:
 *   put:
 *     summary: Rechaza un presupuesto como cliente
 *     tags: [Presupuestos]
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
router.put('/:id/rechazar', controllers.rejectPresupuesto);

/**
 * @swagger
 * /api/presupuestos/{id}/aceptar:
 *   put:
 *     summary: Acepta un presupuesto como cliente
 *     tags: [Presupuestos]
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
router.put('/:id/aceptar', controllers.acceptPresupuesto);

/**
 * @swagger
 * /api/presupuestos/cliente:
 *   post:
 *     summary: Lista presupuestos de un cliente
 *     tags: [Presupuestos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cliente:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Presupuestos del cliente
 */
router.post('/cliente', controllers.getAllPresupuestosByCliente);

module.exports = router;