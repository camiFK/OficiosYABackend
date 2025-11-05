const express = require('express');
const router = express.Router();
const controller = require('../Controllers/PrestadorController');
const imageMiddleware = require('../Middlewares/imageMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');

// Rutas generales de prestadores
router.get('/', controller.getAllPrestadores);
router.get('/:id', controller.getPrestadorById);
router.delete('/delete/:id', authMiddleware.verifyToken, controller.deletePrestador);
router.put('/update/:id', authMiddleware.verifyToken, controller.updatePrestador);
router.put('/:id/categorias', authMiddleware.verifyToken, controller.updateCategorias);
router.get('/:id/solicitudes', authMiddleware.verifyToken, controller.getSolicitudesByPrestadorId);

// Rutas de imágenes de prestadores
router.post('/images', 
    authMiddleware.verifyToken,
    imageMiddleware.memoryUpload.single('image'),
    imageMiddleware.logUploadedFiles,
    controller.uploadPrestadorImage
);

router.post('/:id/imagenes', 
    authMiddleware.verifyToken,
    imageMiddleware.memoryUpload.single('imagen'),
    imageMiddleware.logUploadedFiles,
    controller.saveImage
);

router.delete('/images/:id', 
    authMiddleware.verifyToken,
    controller.deletePrestadorImage
);

router.put('/images/:id', 
    authMiddleware.verifyToken,
    controller.updatePrestadorImage
);

router.get('/:id/images', 
    controller.getPrestadorImages
);

module.exports = router;