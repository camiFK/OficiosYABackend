const { Cliente, SolicitudServicio, Usuario, Ubicacion, Categoria, Presupuesto } = require('../Models/Index');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION, SOLICITUD_ESTADOS } = require('../Utils/constants');

module.exports = {
    // GET /clientes/:id/solicitudes: Obtiene solicitudes de un cliente
    async getSolicitudesByClienteId(req, res) {
        try {
            const { id } = req.params;
            const { 
                page = PAGINATION.DEFAULT_PAGE, 
                limit = PAGINATION.DEFAULT_LIMIT,
                estado,
                categoria 
            } = req.query;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID del cliente debe ser un número entero positivo' 
                }]);
            }

            // Verificar que el cliente existe
            const cliente = await Cliente.findByPk(id);
            if (!cliente) {
                return ResponseService.notFound(res, 'Cliente');
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const whereClause = { id_cliente: id };
            
            if (estado && validators.isValidSolicitudEstado(estado)) {
                whereClause.estado = estado;
            }
            
            if (categoria && validators.isValidPositiveInteger(parseInt(categoria))) {
                whereClause.id_categoria = categoria;
            }

            const result = await SolicitudServicio.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre']
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia']
                    }
                ],
                order: [['fecha_creacion', 'DESC']],
                limit: limitNum,
                offset
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener solicitudes del cliente:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /clientes/:id_cliente/solicitudes: Crea una nueva solicitud para un cliente
    async createClienteSolicitud(req, res) {
        try {
            const { id_cliente } = req.params;
            const { id_categoria, id_ubicacion, titulo, descripcion } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id_cliente))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id_cliente', 
                    message: 'ID del cliente debe ser un número entero positivo' 
                }]);
            }

            // Verificar que el cliente existe
            const cliente = await Cliente.findByPk(id_cliente);
            if (!cliente) {
                return ResponseService.notFound(res, 'Cliente');
            }

            // Validaciones de datos
            const validationResult = validators.validateSolicitudData({
                titulo,
                descripcion
            });

            if (!validationResult.isValid) {
                return ResponseService.validationError(res, validationResult.errors);
            }

            if (!validators.isValidPositiveInteger(parseInt(id_categoria))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id_categoria', 
                    message: 'ID de categoría debe ser un número entero positivo' 
                }]);
            }

            if (!validators.isValidPositiveInteger(parseInt(id_ubicacion))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id_ubicacion', 
                    message: 'ID de ubicación debe ser un número entero positivo' 
                }]);
            }

            // Verificar que la categoría y ubicación existen
            const [categoria, ubicacion] = await Promise.all([
                Categoria.findByPk(id_categoria),
                Ubicacion.findByPk(id_ubicacion)
            ]);

            if (!categoria) {
                return ResponseService.notFound(res, 'Categoría');
            }

            if (!ubicacion) {
                return ResponseService.notFound(res, 'Ubicación');
            }

            const nuevaSolicitud = await SolicitudServicio.create({
                id_cliente,
                id_categoria,
                id_ubicacion,
                titulo: validators.sanitizeString(titulo),
                descripcion: validators.sanitizeString(descripcion),
                estado: SOLICITUD_ESTADOS.INICIADA
            });

            // Obtener la solicitud completa con sus relaciones
            const solicitudCompleta = await SolicitudServicio.findByPk(nuevaSolicitud.id_solicitud_servicio, {
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre']
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia']
                    },
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre_completo']
                    }
                ]
            });

            return ResponseService.created(res, solicitudCompleta, 'Solicitud creada exitosamente');

        } catch (error) {
            console.error('Error al crear solicitud:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /solicitudes/:id: Obtiene una solicitud por ID
    async getSolicitudById(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const solicitud = await SolicitudServicio.findByPk(id, {
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre_completo'],
                        include: [{
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['correo']
                        }]
                    },
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre', 'descripcion']
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia']
                    },
                    {
                        model: Presupuesto,
                        as: 'presupuestos',
                        include: [{
                            association: 'prestador',
                            attributes: ['id_prestador', 'nombre_completo', 'telefono']
                        }]
                    }
                ]
            });

            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud');
            }

            return ResponseService.success(res, solicitud, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener solicitud:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /clientes/:id: Obtiene información de un cliente
    async getClienteById(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const cliente = await Cliente.findByPk(id, {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: { exclude: ['contrasena'] }
                    },
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia']
                    }
                ]
            });

            if (!cliente) {
                return ResponseService.notFound(res, 'Cliente');
            }

            return ResponseService.success(res, cliente, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener cliente:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // PUT /solicitudes/:id: Actualiza una solicitud
    async updateSolicitud(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descripcion, estado } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const solicitud = await SolicitudServicio.findByPk(id);
            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud');
            }

            // Validaciones
            const validationErrors = [];

            if (titulo && !validators.isValidLength(titulo.trim(), 5, 100)) {
                validationErrors.push({ 
                    field: 'titulo', 
                    message: 'El título debe tener entre 5 y 100 caracteres' 
                });
            }

            if (descripcion && !validators.isValidLength(descripcion.trim(), 10, 1000)) {
                validationErrors.push({ 
                    field: 'descripcion', 
                    message: 'La descripción debe tener entre 10 y 1000 caracteres' 
                });
            }

            if (estado && !validators.isValidSolicitudEstado(estado)) {
                validationErrors.push({ 
                    field: 'estado', 
                    message: 'Estado de solicitud inválido' 
                });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            const updateData = {};
            if (titulo) updateData.titulo = validators.sanitizeString(titulo);
            if (descripcion) updateData.descripcion = validators.sanitizeString(descripcion);
            if (estado) updateData.estado = estado;

            await solicitud.update(updateData);

            return ResponseService.updated(res, solicitud, 'Solicitud actualizada exitosamente');

        } catch (error) {
            console.error('Error al actualizar solicitud:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // DELETE /solicitudes/:id: Elimina una solicitud
    async deleteSolicitud(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const solicitud = await SolicitudServicio.findByPk(id);
            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud');
            }

            // Verificar si se puede eliminar (no debe tener presupuestos activos)
            const presupuestosCount = await Presupuesto.count({
                where: { 
                    id_solicitud: id,
                    estado: ['pendiente', 'aceptado']
                }
            });

            if (presupuestosCount > 0) {
                return ResponseService.error(
                    res, 
                    'No se puede eliminar la solicitud porque tiene presupuestos activos', 
                    HTTP_STATUS.CONFLICT
                );
            }

            await solicitud.destroy();

            return ResponseService.deleted(res, 'Solicitud eliminada exitosamente');

        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};