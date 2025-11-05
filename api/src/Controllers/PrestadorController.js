const { Prestador, Categoria, Ubicacion, SolicitudPrestador, Usuario, ImagenPrestador, Presupuesto, PrestadorCategoria } = require('../Models/Index');
const ImageService = require('../Services/ImageService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION } = require('../Utils/constants');

module.exports = {
    // GET /prestadores: Obtiene todos los prestadores con paginación y filtros
    async getAllPrestadores(req, res) {
        try {
            const { 
                page = PAGINATION.DEFAULT_PAGE, 
                limit = PAGINATION.DEFAULT_LIMIT,
                categoria,
                ubicacion,
                busqueda
            } = req.query;

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const includeOptions = [
                {
                    model: Categoria,
                    as: 'categorias',
                    through: { attributes: [] }, 
                    attributes: ['id_categoria', 'nombre', 'descripcion']
                },
                {
                    model: Ubicacion,
                    as: 'ubicacion',
                    attributes: ['id_ubicacion', 'localidad', 'provincia', 'direccion']
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['contrasena'] }
                },
                {
                    model: ImagenPrestador,
                    as: 'imagenes',
                    attributes: ['id_imagen_prestador', 'ruta_imagen', 'descripcion'],
                    limit: 1,
                    order: [['fecha_subida', 'DESC']]
                }
            ];

            const whereClause = {};

            // Filtro por ubicación
            if (ubicacion && validators.isValidPositiveInteger(parseInt(ubicacion))) {
                whereClause.id_ubicacion = ubicacion;
            }

            // Filtro por búsqueda en nombre o descripción
            if (busqueda && busqueda.trim().length > 0) {
                const searchTerm = `%${busqueda.trim()}%`;
                whereClause[require('sequelize').Op.or] = [
                    { nombre_completo: { [require('sequelize').Op.like]: searchTerm } },
                    { descripcion: { [require('sequelize').Op.like]: searchTerm } }
                ];
            }

            let result;

            if (categoria && validators.isValidPositiveInteger(parseInt(categoria))) {
                // Búsqueda por categoría específica
                result = await Prestador.findAndCountAll({
                    where: whereClause,
                    include: [
                        ...includeOptions,
                        {
                            model: Categoria,
                            as: 'categorias',
                            where: { id_categoria: categoria },
                            through: { attributes: [] },
                            attributes: ['id_categoria', 'nombre', 'descripcion'],
                            required: true
                        }
                    ],
                    order: [['fecha_alta', 'DESC']],
                    limit: limitNum,
                    offset,
                    distinct: true
                });
            } else {
                result = await Prestador.findAndCountAll({
                    where: whereClause,
                    include: includeOptions,
                    order: [['fecha_alta', 'DESC']],
                    limit: limitNum,
                    offset
                });
            }

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);
            
        } catch (error) {
            console.error('Error al obtener prestadores:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /prestadores/:id: Obtiene un prestador por ID con información completa
    async getPrestadorById(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id, {
                include: [
                    {
                        model: Categoria,
                        as: 'categorias',
                        through: { attributes: [] }, 
                        attributes: ['id_categoria', 'nombre', 'descripcion']
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia', 'direccion']
                    },
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['contrasena'] }
                    },
                    {
                        model: ImagenPrestador,
                        as: 'imagenes',
                        attributes: ['id_imagen_prestador', 'ruta_imagen', 'descripcion', 'fecha_subida'],
                        order: [['fecha_subida', 'DESC']]
                    }
                ]
            });

            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            return ResponseService.success(res, prestador, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener prestador:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // PUT /prestadores/:id: Actualiza información de un prestador
    async updatePrestador(req, res) {
        try {
            const { id } = req.params;
            const { nombre_completo, telefono, id_ubicacion, descripcion, experiencia } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Validaciones
            const validationErrors = [];

            if (nombre_completo && !validators.isValidName(nombre_completo)) {
                validationErrors.push({ 
                    field: 'nombre_completo', 
                    message: validators.getNameErrorMessage() 
                });
            }

            if (telefono && !validators.isValidPhone(telefono)) {
                validationErrors.push({ 
                    field: 'telefono', 
                    message: validators.getPhoneErrorMessage() 
                });
            }

            if (descripcion && !validators.isValidLength(descripcion.trim(), 0, 1000)) {
                validationErrors.push({ 
                    field: 'descripcion', 
                    message: 'La descripción no puede exceder 1000 caracteres' 
                });
            }

            if (experiencia && !validators.isValidLength(experiencia.trim(), 0, 1000)) {
                validationErrors.push({ 
                    field: 'experiencia', 
                    message: 'La experiencia no puede exceder 1000 caracteres' 
                });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            // Verificar ubicación si se proporciona
            if (id_ubicacion) {
                if (!validators.isValidPositiveInteger(parseInt(id_ubicacion))) {
                    return ResponseService.validationError(res, [{ 
                        field: 'id_ubicacion', 
                        message: 'ID de ubicación debe ser un número entero positivo' 
                    }]);
                }

                const ubicacion = await Ubicacion.findByPk(id_ubicacion);
                if (!ubicacion) {
                    return ResponseService.notFound(res, 'Ubicación');
                }
            }

            const updateData = {};
            if (nombre_completo) updateData.nombre_completo = validators.sanitizeString(nombre_completo);
            if (telefono) updateData.telefono = validators.sanitizeString(telefono);
            if (id_ubicacion) updateData.id_ubicacion = id_ubicacion;
            if (descripcion !== undefined) updateData.descripcion = descripcion ? validators.sanitizeString(descripcion) : null;
            if (experiencia !== undefined) updateData.experiencia = experiencia ? validators.sanitizeString(experiencia) : null;

            await prestador.update(updateData);

            // Obtener prestador actualizado con relaciones
            const prestadorActualizado = await Prestador.findByPk(id, {
                include: [
                    {
                        model: Categoria,
                        as: 'categorias',
                        through: { attributes: [] },
                        attributes: ['id_categoria', 'nombre']
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia']
                    }
                ]
            });

            return ResponseService.updated(res, prestadorActualizado, 'Prestador actualizado exitosamente');

        } catch (error) {
            console.error('Error al actualizar prestador:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // DELETE /prestadores/:id: Elimina un prestador
    async deletePrestador(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Verificar si tiene presupuestos activos
            const presupuestosActivos = await Presupuesto.count({
                where: { 
                    id_prestador: id,
                    estado: ['pendiente', 'aceptado']
                }
            });

            if (presupuestosActivos > 0) {
                return ResponseService.error(
                    res, 
                    'No se puede eliminar el prestador porque tiene presupuestos activos', 
                    HTTP_STATUS.CONFLICT
                );
            }

            await prestador.destroy();

            return ResponseService.deleted(res, 'Prestador eliminado exitosamente');

        } catch (error) {
            console.error('Error al eliminar prestador:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // PUT /prestadores/:id/categorias: Actualiza las categorías de un prestador
    async updateCategorias(req, res) {
        try {
            const { id } = req.params;
            const { categoriasIds } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Validar categoriasIds
            if (!Array.isArray(categoriasIds)) {
                return ResponseService.validationError(res, [{ 
                    field: 'categoriasIds', 
                    message: 'categoriasIds debe ser un array' 
                }]);
            }

            // Verificar que todas las categorías existen
            if (categoriasIds.length > 0) {
                const categoriasExistentes = await Categoria.findAll({
                    where: { id_categoria: categoriasIds }
                });

                if (categoriasExistentes.length !== categoriasIds.length) {
                    return ResponseService.validationError(res, [{ 
                        field: 'categoriasIds', 
                        message: 'Una o más categorías no existen' 
                    }]);
                }
            }

            // Actualizar relaciones (sobrescribe relaciones existentes)
            await prestador.setCategorias(categoriasIds);

            const prestadorActualizado = await Prestador.findByPk(id, {
                include: { 
                    model: Categoria, 
                    as: 'categorias',
                    through: { attributes: [] },
                    attributes: ['id_categoria', 'nombre', 'descripcion']
                }
            });

            return ResponseService.updated(res, prestadorActualizado, 'Categorías actualizadas exitosamente');

        } catch (error) {
            console.error('Error al actualizar categorías:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /prestadores/:id/imagenes: Guarda una imagen para un prestador
    async saveImage(req, res) {
        try {
            const { id } = req.params;
            const { descripcion } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            if (!req.file) {
                return ResponseService.validationError(res, [{ 
                    field: 'imagen', 
                    message: 'Se requiere una imagen' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Validar y subir imagen a ImgBB
            const imageUrl = await ImageService.uploadToImgBB(req.file);

            const newImage = await ImagenPrestador.create({
                id_prestador: id,
                ruta_imagen: imageUrl,
                nombre_archivo: req.file.originalname,
                descripcion: descripcion ? validators.sanitizeString(descripcion) : null,
                fecha_subida: new Date()
            });

            return ResponseService.created(res, newImage, 'Imagen subida y guardada exitosamente');
            
        } catch (error) {
            console.error('Error al guardar imagen:', error);
            return ResponseService.serverError(res, 'Error al procesar la imagen: ' + error.message);
        }
    },

    // GET /prestadores/:id/solicitudes: Obtiene solicitudes de un prestador
    async getSolicitudesByPrestadorId(req, res) {
        try {
            const { id } = req.params;
            const { 
                page = PAGINATION.DEFAULT_PAGE, 
                limit = PAGINATION.DEFAULT_LIMIT,
                estado 
            } = req.query;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Validacion de permisos
            const { id_usuario, id_rol } = req.user;

            // Verificar que sea el prestador o el admin
            if (id_rol !== 1) {
                const isPrestadorOwner = await Prestador.findOne({
                    where: {id_prestador: id, id_usuario: id_usuario}
                });

                if (!isPrestadorOwner) {
                    return ResponseService.error(
                        res,
                        'No tienes permisos para ver estas solicitudes',
                        HTTP_STATUS.FORBIDDEN
                    );
                }
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const whereClause = { id_prestador: id };
            if (estado) {
                whereClause.estado = estado;
            }

            const result = await SolicitudPrestador.findAndCountAll({
                where: whereClause,
                include: [{
                    association: 'solicitud',
                    include: [
                        {
                            association: 'cliente',
                            attributes: ['id_cliente', 'nombre_completo']
                        },
                        {
                            association: 'categoria',
                            attributes: ['id_categoria', 'nombre']
                        },
                        {
                            association: 'ubicacion',
                            attributes: ['localidad', 'provincia']
                        }
                    ]
                }],
                order: [['fecha_envio', 'DESC']],
                limit: limitNum,
                offset
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener solicitudes del prestador:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /prestadores/:id/presupuestos: Obtiene presupuestos de un prestador
    async getPresupuestosByPrestadorId(req, res) {
        try {
            const { id } = req.params;
            const { 
                page = PAGINATION.DEFAULT_PAGE, 
                limit = PAGINATION.DEFAULT_LIMIT,
                estado 
            } = req.query;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const whereClause = { id_prestador: id };
            if (estado) {
                whereClause.estado = estado;
            }

            const result = await Presupuesto.findAndCountAll({
                where: whereClause,
                include: [{
                    association: 'solicitud',
                    include: [
                        {
                            association: 'cliente',
                            attributes: ['id_cliente', 'nombre_completo']
                        },
                        {
                            association: 'categoria',
                            attributes: ['id_categoria', 'nombre']
                        }
                    ]
                }],
                order: [['fecha_envio', 'DESC']],
                limit: limitNum,
                offset
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener presupuestos del prestador:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /prestadores/images - Subir imagen del prestador
    async uploadPrestadorImage(req, res) {
        try {
            const prestadorId = req.prestadorId || req.userId; // Del token JWT
            
            if (!req.file) {
                return ResponseService.validationError(res, [{ 
                    field: 'image', 
                    message: 'No se proporcionó ningún archivo de imagen' 
                }]);
            }

            // Validar que el prestador existe
            const prestador = await Prestador.findByPk(prestadorId);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Validar la imagen y subirla a ImgBB
            const imageUrl = await ImageService.uploadToImgBB(req.file);

            // Crear registro en la base de datos
            const imagenPrestador = await ImagenPrestador.create({
                id_prestador: prestadorId,
                ruta_imagen: imageUrl,
                nombre_archivo: req.file.originalname,
                descripcion: req.body.descripcion || 'Imagen del prestador',
                fecha_subida: new Date()
            });

            return ResponseService.created(res, {
                id: imagenPrestador.id_imagen_prestador,
                url: imagenPrestador.ruta_imagen,
                filename: imagenPrestador.nombre_archivo,
                originalName: req.file.originalname,
                description: imagenPrestador.descripcion,
                uploadDate: imagenPrestador.fecha_subida
            }, 'Imagen del prestador subida exitosamente');

        } catch (error) {
            console.error('Error uploading prestador image:', error);
            return ResponseService.serverError(res, 'Error al procesar la imagen: ' + error.message);
        }
    },

    // DELETE /prestadores/images/:id - Eliminar imagen del prestador
    async deletePrestadorImage(req, res) {
        try {
            const { id } = req.params;
            const prestadorId = req.prestadorId || req.userId;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID de imagen debe ser un número válido' 
                }]);
            }

            // Buscar la imagen
            const imagen = await ImagenPrestador.findOne({
                where: { 
                    id_imagen_prestador: id,
                    id_prestador: prestadorId 
                }
            });

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen');
            }

            // Solo eliminamos el registro de la base de datos
            await imagen.destroy();

            return ResponseService.deleted(res, 'Imagen eliminada exitosamente');

        } catch (error) {
            console.error('Error deleting prestador image:', error);
            return ResponseService.serverError(res, 'Error interno al eliminar la imagen');
        }
    },

    // PUT /prestadores/images/:id - Actualizar información de imagen del prestador
    async updatePrestadorImage(req, res) {
        try {
            const { id } = req.params;
            const prestadorId = req.prestadorId || req.userId;
            const { descripcion } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID de imagen debe ser un número válido' 
                }]);
            }

            // Buscar la imagen
            const imagen = await ImagenPrestador.findOne({
                where: { 
                    id_imagen_prestador: id,
                    id_prestador: prestadorId 
                }
            });

            if (!imagen) {
                return ResponseService.notFound(res, 'Imagen');
            }

            // Actualizar solo los campos permitidos
            const updateData = {};
            if (descripcion !== undefined) {
                updateData.descripcion = validators.sanitizeString(descripcion);
            }

            if (Object.keys(updateData).length === 0) {
                return ResponseService.validationError(res, [{ 
                    field: 'data', 
                    message: 'No se proporcionaron datos para actualizar' 
                }]);
            }

            await imagen.update(updateData);

            return ResponseService.updated(res, {
                id: imagen.id_imagen_prestador,
                url: imagen.ruta_imagen,
                filename: imagen.nombre_archivo,
                description: imagen.descripcion,
                uploadDate: imagen.fecha_subida
            }, 'Imagen actualizada exitosamente');

        } catch (error) {
            console.error('Error updating prestador image:', error);
            return ResponseService.serverError(res, 'Error interno al actualizar la imagen');
        }
    },

    // GET /prestadores/:id/images - Obtener todas las imágenes de un prestador
    async getPrestadorImages(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID del prestador debe ser un número válido' 
                }]);
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            const result = await ImagenPrestador.findAndCountAll({
                where: { id_prestador: id },
                order: [['fecha_subida', 'DESC']],
                limit: limitNum,
                offset,
                attributes: [
                    'id_imagen_prestador',
                    'ruta_imagen', 
                    'nombre_archivo',
                    'descripcion',
                    'fecha_subida'
                ]
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, 'Imágenes del prestador obtenidas exitosamente');

        } catch (error) {
            console.error('Error getting prestador images:', error);
            return ResponseService.error(res, 'Error interno al obtener las imágenes', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};