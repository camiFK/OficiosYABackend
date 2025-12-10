const express = require('express');
const router = express.Router();
const controllers = require('../Controllers/UbicacionController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

router.get('/', controllers.getAllUbicaciones);
router.get('/provincias', controllers.getProvincias);
router.get('/:id', controllers.getUbicacionById);
router.get('/localidad/:localidad', controllers.getLocalidadByName);
router.get('/localidades/:provincia', controllers.getLocalidadesByProvincia);
router.post('/', controllers.createUbicacion);

module.exports = router;