const ImageService = require('../Services/ImageService');
const ResponseService = require('../Services/ResponseService');
const { ImagenPrestador, ImagenSolicitud, Prestador, SolicitudServicio } = require('../Models/Index');

module.exports = {
    async uploadPrestadorImages(req, res) {
        try {
            if (!req.files || (!req.files.imagen && !req.files.imagenes)) {
                return ResponseService.validationError(res, { 
                    images: 'No se proporcionó archivo de imagen'
                }, 'Archivo faltante');
            }

            const file = (req.files.imagenes || req.files.imagen)[0] || (req.files.imagenes || req.files.imagen); // Solo una imagen, pero puede ser array

            const prestadorId = Array.isArray(req.body.prestadorId) ? req.body.prestadorId[0] : req.body.prestadorId;

            if (!prestadorId) {
                return ResponseService.validationError(res, {
                    prestadorId: 'El ID del prestador es requerido'
                }, 'ID de prestador faltante');
            }

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(parseInt(prestadorId));
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador no encontrado');
            }

            // Verificar que no haya ya una imagen para este prestador
            const existingImage = await ImagenPrestador.findOne({
                where: { id_prestador: parseInt(prestadorId) }
            });
            if (existingImage) {
                return ResponseService.validationError(res, {
                    prestadorId: 'El prestador ya tiene una imagen asociada. Solo se permite una imagen por prestador.'
                }, 'Imagen ya existe');
            }

            // Validar imagen
            ImageService.validateImage(file);

            // Subir imagen a ImgBB
            const imgbbUrl = await ImageService.uploadToImgBB(file);

            // Guardar en la base de datos con URL de ImgBB
            const descripcion = Array.isArray(req.body.descripcion) ? req.body.descripcion[0] : req.body.descripcion;
            const imagenPrestador = await ImagenPrestador.create({
                id_prestador: parseInt(prestadorId),
                ruta_imagen: imgbbUrl, // URL de ImgBB
                descripcion: descripcion || null,
                fecha_subida: new Date()
            });

            const uploadedImage = {
                id: imagenPrestador.id_imagen_prestador,
                prestadorId: imagenPrestador.id_prestador,
                originalName: file.originalFilename,
                url: imagenPrestador.ruta_imagen,
                descripcion: imagenPrestador.descripcion,
                fechaSubida: imagenPrestador.fecha_subida,
                size: file.size,
                mimetype: file.mimetype,
                provider: 'imgbb'
            };

            return ResponseService.success(res, uploadedImage, 'Imagen de prestador subida exitosamente');
        } catch (error) {
            console.error('Error al subir imagen de prestador:', error);
            return ResponseService.serverError(res, 'Error al subir imagen: ' + error.message);
        }
    },

    async uploadSolicitudImages(req, res) {
        try {
            if (!req.files || (!req.files.imagen && !req.files.imagenes)) {
                return ResponseService.validationError(res, { 
                    images: 'No se proporcionó archivo de imagen'
                }, 'Archivo faltante');
            }

            const file = (req.files.imagenes || req.files.imagen)[0] || (req.files.imagenes || req.files.imagen); // Solo una imagen, pero puede ser array

            const solicitudId = req.body.id_solicitud || (req.body['id_solicitud\n'] && req.body['id_solicitud\n'][0]);

            if (!solicitudId) {
                return ResponseService.validationError(res, {
                    id_solicitud: 'El ID de la solicitud es requerido'
                }, 'ID de solicitud faltante');
            }

            // Verificar que la solicitud existe
            const solicitud = await SolicitudServicio.findByPk(parseInt(solicitudId));
            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud no encontrada');
            }

            // Verificar que no haya ya una imagen para esta solicitud
            const existingImage = await ImagenSolicitud.findOne({
                where: { id_solicitud: parseInt(solicitudId) }
            });
            if (existingImage) {
                return ResponseService.validationError(res, {
                    solicitudId: 'La solicitud ya tiene una imagen asociada. Solo se permite una imagen por solicitud.'
                }, 'Imagen ya existe');
            }

            // Validar imagen
            ImageService.validateImage(file);

            // Subir imagen a ImgBB
            const imgbbUrl = await ImageService.uploadToImgBB(file);

            // Guardar en la base de datos con URL de ImgBB
            const descripcionSolicitud = Array.isArray(req.body.descripcion) ? req.body.descripcion[0] : req.body.descripcion;
            const imagenSolicitud = await ImagenSolicitud.create({
                id_solicitud: parseInt(solicitudId),
                ruta_imagen: imgbbUrl, // URL de ImgBB
                descripcion: descripcionSolicitud || null,
                fecha_subida: new Date()
            });

            const uploadedImage = {
                id: imagenSolicitud.id_imagen_solicitud,
                solicitudId: imagenSolicitud.id_solicitud,
                originalName: file.originalFilename || file.name,
                url: imagenSolicitud.ruta_imagen,
                descripcion: imagenSolicitud.descripcion,
                fechaSubida: imagenSolicitud.fecha_subida,
                size: file.size,
                mimetype: file.mimetype,
                provider: 'imgbb'
            };

            return ResponseService.success(res, uploadedImage, 'Imagen de solicitud subida exitosamente');
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

            // Buscar el id_prestador del usuario autenticado
            const usuarioId = req.user?.id_usuario || req.userId;
            const prestador = await Prestador.findOne({ where: { id_usuario: usuarioId } });
            if (!prestador) {
                return ResponseService.error(res, 'No se encontró el prestador asociado al usuario autenticado');
            }

            // Buscar la imagen y validar que pertenezca al prestador autenticado
            const imagen = await ImagenPrestador.findOne({
                where: {
                    id_imagen_prestador: parseInt(imageId),
                    id_prestador: prestador.id_prestador
                }
            });
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

    // DELETE /api/images/prestador/:imageId - Eliminar imagen de prestador
    async deletePrestadorImage(req, res) {
        try {
            const { imageId } = req.params;
            const userId = req.user?.id_usuario || req.userId; // Usar id_usuario

            // Buscar la imagen en la DB
            const image = await ImagenPrestador.findByPk(imageId);
            if (!image) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Verificar que el usuario sea el propietario o admin
            const prestador = await Prestador.findByPk(image.id_prestador);
            if (!prestador || (prestador.id_usuario !== userId && req.user.id_rol !== 1)) {
                return ResponseService.forbidden(res, 'No autorizado');
            }

            // Eliminar de imgbb
            const imgbbId = ImageService.extractImgbbId(image.ruta_imagen);
            if (imgbbId) {
                await ImageService.deleteFromImgbb(imgbbId);
            }

            // Eliminar de la DB
            await image.destroy();

            return ResponseService.success(res, null, 'Imagen eliminada correctamente');
        } catch (error) {
            console.error('Error eliminando imagen:', error);
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
    },

    // DELETE /api/images/solicitud/:imageId - Eliminar imagen de solicitud
    async deleteSolicitudImage(req, res) {
        try {
            const { imageId } = req.params;
            const userId = req.user?.id_usuario || req.userId; // Usar id_usuario

            // Buscar la imagen en la DB
            const image = await ImagenSolicitud.findByPk(imageId);
            if (!image) {
                return ResponseService.notFound(res, 'Imagen no encontrada');
            }

            // Verificar que el usuario sea cliente o admin
            const solicitud = await SolicitudServicio.findByPk(image.id_solicitud);
            if (!solicitud || (req.user.id_rol !== 2 && req.user.id_rol !== 1)) {
                return ResponseService.forbidden(res, 'No autorizado');
            }

            // Eliminar de imgbb
            const imgbbId = ImageService.extractImgbbId(image.ruta_imagen);
            if (imgbbId) {
                await ImageService.deleteFromImgbb(imgbbId);
            }

            // Eliminar de la DB
            await image.destroy();

            return ResponseService.success(res, null, 'Imagen eliminada correctamente');
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            return ResponseService.serverError(res, 'Error interno del servidor');
        }
    }
};