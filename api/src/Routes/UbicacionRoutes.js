const express = require('express');
const router = express.Router();
const UbicacionController = require('../Controllers/UbicacionController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

router.get('/', UbicacionController.getAllUbicaciones);
router.get('/provincias', UbicacionController.getProvincias);
router.get('/localidades/:provincia', UbicacionController.getLocalidadesByProvincia);
router.post('/', verifyToken, requireRole('Administrador'), UbicacionController.createUbicacion);

module.exports = router;