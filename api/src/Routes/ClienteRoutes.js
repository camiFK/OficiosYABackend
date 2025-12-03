const express = require('express');
const router = express.Router();
const controller = require('../Controllers/ClienteController');
const { verifyToken } = require('../Middlewares/authMiddleware');

router.get('/:id/solicitudes', verifyToken, controller.getSolicitudesByClienteId);
router.post('/:id/solicitudes', verifyToken, controller.createClienteSolicitud);
router.get('/solicitudes/:id', verifyToken, controller.getSolicitudById);
router.put('/solicitudes/:id', verifyToken, controller.updateSolicitud);
router.put('/solicitudes/:id/cancel', verifyToken, controller.cancelSolicitud);
router.get('/solicitudes/:id/prestadores', verifyToken, controller.obtenerPrestadoresPorLocalidad);
router.get('/solicitudes/:id/prestadores-cercanos', verifyToken, controller.obtenerPrestadoresPorLocalidadCercana);

module.exports = router;
