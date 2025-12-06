const controllers = require('../Controllers/PresupuestoController.js');
const express = require('express');
const router = express.Router();

router.get('/:id', controllers.getPresupuestoById);
// Prestador
router.get('/prestador/:id', controllers.getPresupuestoByPrestadorId);
router.get('/prestador/:id/recibidos', controllers.getSolicitudesByPrestadorId);
router.post('/prestador/:id/enviar', controllers.sendPresupuesto);
router.post('/prestador/:id/rechazar', controllers.rejectSolicitud);
router.put('/prestador/:id/aceptar', controllers.acceptSolicitud);
// Cliente
router.put('/:id/rechazar', controllers.rejectPresupuesto);
router.put('/:id/aceptar', controllers.acceptPresupuesto);
router.post('/cliente', controllers.getAllPresupuestosByCliente);

module.exports = router;