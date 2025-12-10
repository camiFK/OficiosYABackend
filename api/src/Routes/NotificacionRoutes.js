const express = require('express');
const router = express.Router();

const NotificacionController = require('../Controllers/NotificacionController');
const { verifyToken } = require('../Middlewares/authMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/',
    ErrorHandler.asyncHandler(NotificacionController.getNotificaciones)
);

router.put('/:id/marcar-leida',
    ErrorHandler.asyncHandler(NotificacionController.marcarLeida)
);

router.put('/marcar-todas-leidas',
    ErrorHandler.asyncHandler(NotificacionController.marcarTodasLeidas)
);

router.delete('/:id',
    ErrorHandler.asyncHandler(NotificacionController.deleteNotificacion)
);

module.exports = router;
