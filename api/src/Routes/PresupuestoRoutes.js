const controllers = require('../Controllers/PresupuestoController.js');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/authMiddleware.js');


router.post('/', authMiddleware.verifyToken, controllers.sendPresupuesto);
router.get('/:id', controllers.getPresupuestoById);
// Prestador
router.get('/prestador/:id/recibidos', controllers.getSolicitudesByPrestadorId);
router.post('/prestador/:id/enviar', controllers.sendPresupuesto);


// Cliente
//router.put('/:id/rechazar', controllers.rejectPresupuesto);
//router.put('/:id/aceptar', controllers.acceptPresupuesto);
router.post('/cliente', controllers.getAllPresupuestosByCliente);

module.exports = router;