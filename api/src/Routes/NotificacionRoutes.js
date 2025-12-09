const express = require('express');
const router = express.Router();

const NotificacionController = require('../Controllers/NotificacionController');
const { verifyToken } = require('../Middlewares/authMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Gestión de notificaciones del usuario autenticado
 */

/**
 * @swagger
 * /api/notificaciones:
 *   get:
 *     summary: Obtiene todas las notificaciones del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/',
    ErrorHandler.asyncHandler(NotificacionController.getNotificaciones)
);

/**
 * @swagger
 * /api/notificaciones/{id}/marcar-leida:
 *   put:
 *     summary: Marca una notificación como leída
 *     tags: [Notificaciones]
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
 *         description: Notificación marcada como leída
 */
router.put('/:id/marcar-leida',
    ErrorHandler.asyncHandler(NotificacionController.marcarLeida)
);

/**
 * @swagger
 * /api/notificaciones/marcar-todas-leidas:
 *   put:
 *     summary: Marca todas las notificaciones como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas marcadas como leídas
 */
router.put('/marcar-todas-leidas',
    ErrorHandler.asyncHandler(NotificacionController.marcarTodasLeidas)
);

/**
 * @swagger
 * /api/notificaciones/{id}:
 *   delete:
 *     summary: Elimina una notificación
 *     tags: [Notificaciones]
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
 *         description: Notificación eliminada
 */
router.delete('/:id',
    ErrorHandler.asyncHandler(NotificacionController.deleteNotificacion)
);

module.exports = router;
