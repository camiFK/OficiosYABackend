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
router.post('/solicitudes/prestadores/crear', verifyToken, controller.createSolicitudPrestador);
router.get('/solicitudes/:id/prestadores-enviados', verifyToken, controller.getPrestadoresEnviadosBySolicitud);
router.put('/presupuesto/:id/aceptar', verifyToken, controller.acceptPresupuesto);
router.put('/presupuesto/:id/rechazar', verifyToken, controller.rejectPresupuesto);

module.exports = router;
