const express = require('express');
const router = express.Router();
const ImageController = require('../Controllers/ImageController');
const imageMiddleware = require('../Middlewares/imageMiddleware');
const authMiddleware = require('../Middlewares/authMiddleware');

// Rutas para imágenes //
/**
 * @swagger
 * tags:
 *   name: Imagenes
 *   description: Gestión de imágenes de prestadores y solicitudes
 */

// Ruta para subir imagen de prestador
/**
 * @swagger
 * /api/images/upload/prestador:
 *   post:
 *     summary: Sube imagen de prestador
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen cargada
 */
router.post('/upload/prestador', 
    authMiddleware.verifyToken, 
    imageMiddleware.uploadSingleImage('imagen'), 
    imageMiddleware.validateImageFile,
    ImageController.uploadPrestadorImages
);

// Ruta para obtener imágenes de prestadores
/**
 * @swagger
 * /api/images/prestador/{prestadorId}:
 *   get:
 *     summary: Obtiene imágenes de un prestador
 *     tags: [Imagenes]
 *     parameters:
 *       - in: path
 *         name: prestadorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de imágenes
 */
router.get('/prestador/:prestadorId', 
    ImageController.getPrestadorImages
);

// Ruta para actualizar descripción de imagen de prestador
/**
 * @swagger
 * /api/images/prestador/{imageId}:
 *   put:
 *     summary: Actualiza imagen de prestador
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen actualizada
 */
router.put('/prestador/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.updatePrestadorImage
);

// Ruta para eliminar imagen de prestador
/**
 * @swagger
 * /api/images/prestador/{imageId}:
 *   delete:
 *     summary: Elimina imagen de prestador
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Imagen eliminada
 */
router.delete('/prestador/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.deletePrestadorImage
);

// Rutas para imágenes de solicitudes //

// Ruta para subir imagen de solicitud
/**
 * @swagger
 * /api/images/upload/solicitud:
 *   post:
 *     summary: Sube imagen de solicitud
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen cargada
 */
router.post('/upload/solicitud', 
    authMiddleware.verifyToken, 
    imageMiddleware.uploadSingleImage('imagen'), 
    imageMiddleware.validateImageFile,
    ImageController.uploadSolicitudImages
);

// Ruta para obtener imágenes de una solicitud
/**
 * @swagger
 * /api/images/solicitud/{solicitudId}:
 *   get:
 *     summary: Imágenes asociadas a una solicitud
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: solicitudId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de imágenes
 */
router.get('/solicitud/:solicitudId', 
    authMiddleware.verifyToken,
    ImageController.getSolicitudImages
);

// Ruta para actualizar descripción de imagen de una solicitud
/**
 * @swagger
 * /api/images/solicitud/{imageId}:
 *   put:
 *     summary: Actualiza imagen de solicitud
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen actualizada
 */
router.put('/solicitud/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.updateSolicitudImage
);

// Ruta para eliminar imagen de una solicitud
/**
 * @swagger
 * /api/images/solicitud/{imageId}:
 *   delete:
 *     summary: Elimina imagen de solicitud
 *     tags: [Imagenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Imagen eliminada
 */
router.delete('/solicitud/:imageId', 
    authMiddleware.verifyToken, 
    ImageController.deleteSolicitudImage
);

module.exports = router;