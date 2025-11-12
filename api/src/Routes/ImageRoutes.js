const express = require('express');
const router = express.Router();
const ImageController = require('../Controllers/ImageController');
const imageMiddleware = require('../Middlewares/imageMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');

// Rutas para imágenes //

// Ruta para imágenes de prestadores
router.post('/upload/prestador', 
    authMiddleware.verifyToken, 
    imageMiddleware.memoryUpload.single('image'), 
    imageMiddleware.logUploadedFiles,
    ImageController.uploadPrestadorImage
);

// Ruta para obtener imágenes de prestadores
router.get('/prestador/:prestadorId', 
    ImageController.getPrestadorImages
);

// Ruta para actualizar descripción de imagen de prestador
router.put('/prestador/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.updatePrestadorImage
);

// Ruta para eliminar imagen de prestador
router.delete('/prestador/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.deletePrestadorImage
);

// Rutas para imágenes de solicitudes //

// Ruta para subir imagen de solicitud
router.post('/upload/solicitud', 
    authMiddleware.verifyToken, 
    imageMiddleware.memoryUpload.single('image'), 
    imageMiddleware.logUploadedFiles,
    ImageController.uploadSolicitudImage
);

// Ruta para obtener imágenes de una solicitud
router.get('/solicitud/:solicitudId', 
    ImageController.getSolicitudImages
);

// Ruta para actualizar descripción de imagen de una solicitud
router.put('/solicitud/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.updateSolicitudImage
);

// Ruta para eliminar imagen de una solicitud
router.delete('/solicitud/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.deleteSolicitudImage
);

module.exports = router;