const axios = require('axios');
const { Cliente, SolicitudServicio, Usuario, Ubicacion, Categoria, Presupuesto, Prestador, PrestadorCategoria } = require('../Models/Index');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION, SOLICITUD_ESTADOS } = require('../Utils/constants');
const { Op } = require('sequelize');

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

            // Verificar que el usuario sea el cliente o administrador
            if (req.userRol !== 'Administrador' && cliente.id_usuario != req.userId) {
                return ResponseService.forbidden(res, 'No tienes permisos para ver estas solicitudes');
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
            // Tomar el id_cliente correctamente del parámetro :id de la URL
            const id_cliente = parseInt(req.params.id, 10);
            const { id_categoria, id_ubicacion, titulo, descripcion } = req.body;

            if (!validators.isValidPositiveInteger(id_cliente)) {
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

            // Verificar que el usuario sea el cliente o administrador
            if (req.userRol !== 'Administrador' && cliente.id_usuario != req.userId) {
                return ResponseService.forbidden(res, 'No tienes permisos para crear solicitudes para este cliente');
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

    // PUT /solicitudes/:id/cancel: Cancela una solicitud
    async cancelSolicitud(req, res) {
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

            // Cambiar estado a cancelada en lugar de eliminar físicamente
            await solicitud.update({ estado: 'Cancelada' });

            return ResponseService.success(res, solicitud, 'Solicitud cancelada exitosamente');

        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

        // GET /solicitudes/:id/prestadores
    async obtenerPrestadoresPorLocalidad(req, res) {
        try {
            const { id } = req.params; 
   
            // Validar id
            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [
                    { field: 'id', message: 'ID de solicitud inválido' }
                ]);
            }

            // Buscar la solicitud con su ubicación
            const solicitud = await SolicitudServicio.findOne({
                where: { id_solicitud_servicio: id },
                include: [
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        attributes: ['id_ubicacion', 'localidad', 'provincia', 'direccion']
                    }
                ]
            });

            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud');
            }

            const localidadSolicitud = solicitud.ubicacion.localidad;
            const categoriaId = solicitud.id_categoria;

            // Buscar prestadores de esa localidad y categoría
            const prestadores = await Prestador.findAll({
                include: [
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        where: { localidad: localidadSolicitud },
                        attributes: ['id_ubicacion', 'localidad', 'provincia', 'direccion']
                    },
                    {
                        model: Categoria,
                        as: 'categorias', 
                        where: { id_categoria: categoriaId },
                        attributes: ['id_categoria', 'nombre']
                    }
                ],
                attributes: [
                    'id_prestador',
                    'nombre_completo',
                    'telefono',
                    'id_ubicacion',
                    'id_usuario'
                ]
            });

            return ResponseService.success(
                res,
                {
                    ubicacion: {
                        localidad: localidadSolicitud,
                        provincia: solicitud.ubicacion.provincia
                    },
                    categoriaId,
                    prestadores
                },
                prestadores.length > 0
                    ? 'Prestadores encontrados en la localidad para la categoría solicitada'
                    : 'No se encontraron prestadores en la localidad para la categoría solicitada'
            );

        } catch (error) {
            console.error('Error al obtener prestadores por localidad:', error);
            return ResponseService.error(
                res,
                ERROR_MESSAGES.INTERNAL_ERROR,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }
    },



     // GET /solicitudes/:id/prestadores-cercanos
    async obtenerPrestadoresPorLocalidadCercana(req, res) {
        try {
            const { id } = req.params;
 
            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [
                    { field: 'id', message: 'ID de solicitud inválido' },
                ]);
            }

            //Obtener la solicitud y su ubicación
            const solicitud = await SolicitudServicio.findOne({
                where: { id_solicitud_servicio: id },
                include: [{ model: Ubicacion, as: 'ubicacion', attributes: ['localidad', 'provincia'] }]
            });

            if (!solicitud) return ResponseService.notFound(res, 'Solicitud');

            const { localidad, provincia } = solicitud.ubicacion;
            const categoriaId = solicitud.id_categoria;

            //Obtener coordenadas de la localidad base desde GeoRef
            const geoResponse = await axios.get(
                `https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(localidad)}&provincia=${encodeURIComponent(provincia)}&max=1`
            );

            if (!geoResponse.data.localidades.length) {
                return ResponseService.error(
                    res,
                    `No se encontraron coordenadas para ${localidad}`,
                    404
                );
            }

            const { lat, lon } = geoResponse.data.localidades[0].centroide;

            //Obtener todas las localidades de la provincia desde GeoRef
            const allLocResponse = await axios.get(
                `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(provincia)}&max=500`
            );

            const radioKm = 15; // radio de búsqueda
            const radianesPorKm = 1 / 111;

            const latMin = lat - radioKm * radianesPorKm;
            const latMax = lat + radioKm * radianesPorKm;
            const lonMin = lon - radioKm * radianesPorKm;
            const lonMax = lon + radioKm * radianesPorKm;

            //Filtrar localidades dentro del radio
            const localidadesCercanasGeoRef = allLocResponse.data.localidades
                .filter(l => l.centroide)
                .filter(l => 
                    l.centroide.lat >= latMin &&
                    l.centroide.lat <= latMax &&
                    l.centroide.lon >= lonMin &&
                    l.centroide.lon <= lonMax
                )
                .map(l => l.nombre);

            //Filtrar solo las localidades que estén en la DB
            const ubicacionesDB = await Ubicacion.findAll({
                where: { localidad: { [Op.in]: localidadesCercanasGeoRef } },
                attributes: ['localidad']
            });

            const localidadesCercanas = ubicacionesDB.map(u => u.localidad);

            //Asegurar incluir la localidad original
            if (!localidadesCercanas.includes(localidad)) localidadesCercanas.push(localidad);

            //Buscar prestadores en esas localidades y categoría
            const prestadores = await Prestador.findAll({
                include: [
                    {
                        model: Ubicacion,
                        as: 'ubicacion',
                        where: { localidad: { [Op.in]: localidadesCercanas } },
                        attributes: ['localidad', 'provincia', 'direccion']
                    },
                    {
                        model: Categoria,
                        as: 'categorias',
                        where: { id_categoria: categoriaId },
                        attributes: ['id_categoria', 'nombre']
                    }
                ],
                attributes: ['id_prestador', 'nombre_completo', 'telefono']
            });

            return ResponseService.success(
                res,
                { localidadBase: localidad, localidadesCercanas, prestadores },
                prestadores.length > 0
                    ? 'Prestadores encontrados en localidades cercanas'
                    : 'No se encontraron prestadores'
            );

        } catch (error) {
            console.error('Error al obtener prestadores cercanos:', error);
            return ResponseService.error(res, error.message || 'Error desconocido', 500);
        }
    },

    async acceptPresupuesto(req, res) {
        try {
            try {
            const { id } = req.params;
            const presupuesto = await Presupuesto.findByPk(id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            presupuesto.estado = 'Pendiente de calificación';
            await presupuesto.save();
            res.status(200).json({ message: 'Presupuesto aceptado correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al aceptar el presupuesto' });
        }
        } catch (error) {
            res.status(500).json({ error: 'Error al aceptar la solicitud del prestador' });
        }
    },

    async rejectPresupuesto(req, res) {
        try {
            const { id } = req.params;
            const presupuesto = await Presupuesto.findByPk(id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            presupuesto.estado = 'Rechazado';
            await presupuesto.save();
            res.status(200).json({ message: 'Presupuesto rechazado correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al rechazar el presupuesto' });
        }
    }
};