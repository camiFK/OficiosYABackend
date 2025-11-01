const express = require('express');
const router = express.Router();
const controller = require('../Controllers/PrestadorController');
const upload = require('../Middlewares/imageMiddleware.js');

router.get('/', controller.getAllPrestadores);
router.get('/:id', controller.getPrestadorById);
router.delete('/delete/:id', controller.deletePrestador);
router.put('/update/:id', controller.updatePrestador);
router.put('/:id/categorias', controller.updateCategorias)
//router.post('/:id/imagenes', upload.single('imagen'), controller.saveImage);
router.get('/:id/solicitudes', controller.getSolicitudesByPrestadorId);

module.exports = router;