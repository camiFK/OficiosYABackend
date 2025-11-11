const express = require('express');
const router = express.Router();
const controller = require('../Controllers/ClienteController');

router.get('/:id/solicitudes', controller.getSolicitudesByClienteId);
router.post('/:id/solicitudes', controller.createClienteSolicitud);
router.get('/solicitudes/:id', controller.getSolicitudById);
router.put('/solicitudes/:id', controller.updateSolicitud);
router.put('/solicitudes/:id/cancel', controller.cancelSolicitud);
router.get('/solicitudes/:id/prestadores',controller.obtenerPrestadoresPorLocalidad);
router.get('/solicitudes/:id/prestadores-cercanos',controller.obtenerPrestadoresPorLocalidadCercana);

module.exports = router;
