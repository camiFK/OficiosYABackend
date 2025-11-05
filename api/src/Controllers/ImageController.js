const { ImageService } = require('../Services/ImageService');
const ResponseService = require('../Services/ResponseService');
const { ImagenPrestador, ImagenSolicitud, Prestador, SolicitudServicio } = require('../Models/Index');

module.exports = {
        // POST /api/images/upload/prestador - Upload imagen de prestador
    async uploadPrestadorImage(req, res) {
        try {
            if (!req.file) {
                return ResponseService.validationError(res, { 
                    image: 'No se proporcionó ningún archivo de imagen'
                }, 'Archivo faltante');
            }

            if (!req.body.prestadorId) {
                return ResponseService.validationError(res, { 
                    prestadorId: 'El ID del prestador es requerido'
                }, 'ID de prestador faltante');
            }

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(parseInt(req.body.prestadorId));
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador no encontrado');
            }

            // Validar imagen
            ImageService.validateImage(req.file);

            // Subir imagen a ImgBB
            const imgbbResponse = await ImageService.uploadToImgBB(req.file);

            // Guardar en la base de datos con URL de ImgBB
            const imagenPrestador = await ImagenPrestador.create({
                id_prestador: parseInt(req.body.prestadorId),
                ruta_imagen: imgbbResponse.url, // URL de ImgBB
                descripcion: req.body.descripcion || null,
                fecha_subida: new Date()
            });

            const response = {
                id: imagenPrestador.id_imagen_prestador,
                prestadorId: imagenPrestador.id_prestador,
                originalName: req.file.originalname,
                url: imagenPrestador.ruta_imagen, // URL de ImgBB
                descripcion: imagenPrestador.descripcion,
                fechaSubida: imagenPrestador.fecha_subida,
                size: req.file.size,
                mimetype: req.file.mimetype,
                provider: 'imgbb'
            };

            return ResponseService.success(res, response, 'Imagen de prestador subida exitosamente');
        } catch (error) {
            console.error('Error al subir imagen de prestador:', error);
            return ResponseService.serverError(res, 'Error al subir imagen: ' + error.message);
        }
    },

    // POST /api/images/upload/solicitud - Upload imagen de solicitud
    async uploadSolicitudImage(req, res) {
        try {
            if (!req.file) {
                return ResponseService.validationError(res, { 
                    image: 'No se proporcionó ningún archivo de imagen'
                }, 'Archivo faltante');
            }

            if (!req.body.solicitudId) {
                return ResponseService.validationError(res, { 
                    solicitudId: 'El ID de la solicitud es requerido'
                }, 'ID de solicitud faltante');
            }

            // Verificar que la solicitud existe
            const solicitud = await SolicitudServicio.findByPk(parseInt(req.body.solicitudId));
            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud no encontrada');
            }

            // Validar imagen
            ImageService.validateImage(req.file);

            // Subir imagen a ImgBB
            const imgbbResponse = await ImageService.uploadToImgBB(req.file);

            // Guardar en la base de datos con URL de ImgBB
            const imagenSolicitud = await ImagenSolicitud.create({
                id_solicitud: parseInt(req.body.solicitudId),
                ruta_imagen: imgbbResponse.url, // URL de ImgBB
                descripcion: req.body.descripcion || null,
                fecha_subida: new Date()
            });

            const response = {
                id: imagenSolicitud.id_imagen_solicitud,
                solicitudId: imagenSolicitud.id_solicitud,
                originalName: req.file.originalname,
                url: imagenSolicitud.ruta_imagen,
                descripcion: imagenSolicitud.descripcion,
                fechaSubida: imagenSolicitud.fecha_subida,
                size: req.file.size,
                mimetype: req.file.mimetype,
                provider: 'imgbb'
            };

            return ResponseService.success(res, response, 'Imagen de solicitud subida exitosamente');
        } catch (error) {
            console.error('Error al subir imagen de solicitud:', error);
            return ResponseService.serverError(res, 'Error al subir imagen: ' + error.message);
        }
    },

    // GET /api/images/prestador/:prestadorId - Obtener todas las imágenes de un prestador
    async getPrestadorImages(req, res) {
        try {
            const { prestadorId } = req.params;

            if (!prestadorId) {
                return ResponseService.validationError(res, [{ 
                    field: 'prestadorId', 
                    message: 'ID del prestador requerido' 
                }]);
            }

            const imagenes = await ImagenPrestador.findAll({
                where: { id_prestador: parseInt(prestadorId) },
                order: [['fecha_subida', 'DESC']]
            });

            const response = imagenes.map(img => ({
                id: img.id_imagen_prestador,
                prestadorId: img.id_prestador,
                url: img.ruta_imagen,
                descripcion: img.descripcion,
                fechaSubida: img.fecha_subida
            }));

            return ResponseService.success(res, response, `${imagenes.length} imágenes encontradas`);
        } catch (error) {
            console.error('Error al obtener imágenes del prestador:', error);
            return ResponseService.serverError(res, 'Error interno del servidor');
        }
    },

    // GET /api/images/solicitud/:solicitudId - Obtener todas las imágenes de una solicitud
    async getSolicitudImages(req, res) {
        try {
            const { solicitudId } = req.params;

            if (!solicitudId) {
                return ResponseService.validationError(res, [{ 
                    field: 'solicitudId', 
                    message: 'ID de la solicitud requerido' 
                }]);
            }

            const imagenes = await ImagenSolicitud.findAll({
                where: { id_solicitud: parseInt(solicitudId) },
                order: [['fecha_subida', 'DESC']]
            });

            const response = imagenes.map(img => ({
                id: img.id_imagen_solicitud,
                solicitudId: img.id_solicitud,
                url: img.ruta_imagen,
                descripcion: img.descripcion,
                fechaSubida: img.fecha_subida
            }));

            return ResponseService.success(res, response, `${imagenes.length} imágenes encontradas`);
        } catch (error) {
            console.error('Error al obtener imágenes de la solicitud:', error);
            return ResponseService.serverError(res, 'Error interno del servidor');
        }
    },

    // DELETE /api/images/prestador/:imageId - Eliminar imagen de prestador
    async deletePrestadorImage(req, res) {
        try {
            const { imageId } = req.params;

            if (!imageId) {
                return ResponseService.validationError(res, { 
                    imageId: 'ID de imagen requerido'
                }, 'ID de imagen faltante');
            }

            // Buscar la imagen en la base de datos
            const imagen = await ImagenPrestador.findByPk(parseInt(imageId));

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Eliminar registro de la base de datos
            // Nota: No podemos eliminar de ImgBB sin el delete_url que no guardamos
            // En ImgBB las imágenes se eliminan automáticamente después de un tiempo si no se acceden
            await imagen.destroy();

            return ResponseService.success(res, null, 'Imagen eliminada exitosamente de la base de datos');
        } catch (error) {
            console.error('Error al eliminar imagen del prestador:', error);
            return ResponseService.serverError(res, 'Error al eliminar imagen: ' + error.message);
        }
    },

    // DELETE /api/images/solicitud/:imageId - Eliminar imagen de solicitud
    async deleteSolicitudImage(req, res) {
        try {
            const { imageId } = req.params;

            if (!imageId) {
                return ResponseService.validationError(res, { 
                    imageId: 'ID de imagen requerido'
                }, 'ID de imagen faltante');
            }

            // Buscar la imagen en la base de datos
            const imagen = await ImagenSolicitud.findByPk(parseInt(imageId));

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Eliminar registro de la base de datos
            await imagen.destroy();

            return ResponseService.success(res, null, 'Imagen eliminada exitosamente de la base de datos');
        } catch (error) {
            console.error('Error al eliminar imagen de la solicitud:', error);
            return ResponseService.serverError(res, 'Error al eliminar imagen: ' + error.message);
        }
    },

    // PUT /api/images/prestador/:imageId - Actualizar descripción de imagen de prestador
    async updatePrestadorImage(req, res) {
        try {
            const { imageId } = req.params;
            const { descripcion } = req.body;

            if (!imageId) {
                return ResponseService.validationError(res, [{ 
                    field: 'imageId', 
                    message: 'ID de imagen requerido' 
                }]);
            }

            // Buscar la imagen
            const imagen = await ImagenPrestador.findByPk(parseInt(imageId));

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Actualizar la descripción
            imagen.descripcion = descripcion || null;
            await imagen.save();

            const response = {
                id: imagen.id_imagen_prestador,
                prestadorId: imagen.id_prestador,
                url: imagen.ruta_imagen,
                descripcion: imagen.descripcion,
                fechaSubida: imagen.fecha_subida
            };

            return ResponseService.success(res, response, 'Imagen actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar imagen del prestador:', error);
            return ResponseService.serverError(res, 'Error interno del servidor');
        }
    },

    // PUT /api/images/solicitud/:imageId - Actualizar descripción de imagen de solicitud
    async updateSolicitudImage(req, res) {
        try {
            const { imageId } = req.params;
            const { descripcion } = req.body;

            if (!imageId) {
                return ResponseService.validationError(res, [{ 
                    field: 'imageId', 
                    message: 'ID de imagen requerido' 
                }]);
            }

            // Buscar la imagen
            const imagen = await ImagenSolicitud.findByPk(parseInt(imageId));

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Actualizar la descripción
            imagen.descripcion = descripcion || null;
            await imagen.save();

            const response = {
                id: imagen.id_imagen_solicitud,
                solicitudId: imagen.id_solicitud,
                url: imagen.ruta_imagen,
                descripcion: imagen.descripcion,
                fechaSubida: imagen.fecha_subida
            };

            return ResponseService.success(res, response, 'Imagen actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar imagen de la solicitud:', error);
            return ResponseService.serverError(res, 'Error interno del servidor');
        }
    }
};