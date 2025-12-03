const express = require('express');
const router = express.Router();

const CalificacionController = require('../Controllers/CalificacionController');
const { verifyToken } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

// POST /api/calificaciones: Registra la calificación de un prestador
router.post('/',
    verifyToken,
    ValidationMiddleware.validateRequired(['estrellas', 'id_solicitud', 'id_prestador']),
    ErrorHandler.asyncHandler(CalificacionController.crearCalificacion)
);

// GET /api/calificaciones/prestador/:id: Devuelve todas las calificaciones de un prestador
router.get('/prestador/:id',
    verifyToken,
    ValidationMiddleware.validatePositiveInteger('id'),
    ErrorHandler.asyncHandler(CalificacionController.getCalificacionesByPrestador)
);

module.exports = router;