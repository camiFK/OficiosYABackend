const express = require('express');
const router = express.Router();
const controller = require('../Controllers/ClienteController');

router.get('/:id/solicitudes', controller.getSolicitudesByClienteId);
router.post('/:id/solicitudes', controller.createClienteSolicitud);
router.get('/solicitudes/:id', controller.getSolicitudById);

module.exports = router;
