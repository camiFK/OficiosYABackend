const { Ubicacion } = require('../Models/Index');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION } = require('../Utils/constants');

module.exports = {
    // GET /ubicaciones: Obtiene todas las ubicaciones disponibles con paginación
    async getAllUbicaciones(req, res) {
        try {
            const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, provincia } = req.query;
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const whereClause = provincia ? { provincia } : {};

            const result = await Ubicacion.findAndCountAll({
                where: whereClause,
                attributes: ['id_ubicacion', 'localidad', 'provincia', 'direccion'],
                order: [['provincia', 'ASC'], ['localidad', 'ASC']],
                limit: limitNum,
                offset
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /ubicaciones/:id: Obtiene una ubicación por ID
    async getUbicacionById(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ field: 'id', message: 'ID debe ser un número entero positivo' }]);
            }

            const ubicacion = await Ubicacion.findByPk(id);
            
            if (!ubicacion) {
                return ResponseService.notFound(res, 'Ubicación');
            }

            return ResponseService.success(res, ubicacion, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {   
            console.error('Error al obtener la ubicación por ID:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /ubicaciones/provincias: Obtiene todas las provincias únicas
    async getProvincias(req, res) {
        try {
            const ubicaciones = await Ubicacion.findAll({
                attributes: ['provincia'],
                group: ['provincia'],
                order: [['provincia', 'ASC']]
            });

            const provincias = ubicaciones.map(u => u.provincia);
            
            return ResponseService.success(res, provincias, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener provincias:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /ubicaciones/localidad/:localidad: Obtiene ubicación por nombre de localidad
    async getLocalidadByName(req, res) {
        try {
            const localidad = decodeURIComponent(req.params.localidad).trim();

            if (!validators.isValidLength(localidad, 2, 100)) {
                return ResponseService.validationError(res, [{ field: 'localidad', message: 'La localidad debe tener entre 2 y 100 caracteres' }]);
            }

            const ubicacion = await Ubicacion.findOne({
                where: { localidad }
            });

            if (!ubicacion) {
                return ResponseService.notFound(res, 'Ubicación');
            }

            return ResponseService.success(res, ubicacion, SUCCESS_MESSAGES.DATA_RETRIEVED);
            
        } catch (error) {
            console.error('Error al obtener localidad:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /ubicaciones/localidades/:provincia: Obtiene todas las localidades de una provincia
    async getLocalidadesByProvincia(req, res) {
        try {
            const provincia = decodeURIComponent(req.params.provincia).trim();

            if (!validators.isValidLength(provincia, 2, 100)) {
                return ResponseService.validationError(res, [{ field: 'provincia', message: 'La provincia debe tener entre 2 y 100 caracteres' }]);
            }

            const ubicaciones = await Ubicacion.findAll({
                where: { provincia },
                attributes: ['id_ubicacion', 'localidad'],
                order: [['localidad', 'ASC']]
            });

            return ResponseService.success(res, ubicaciones, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener localidades:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /ubicaciones: Crea una nueva ubicación (solo admin)
async createUbicacion(req, res) {
  try {
    const { localidad, provincia, direccion } = req.body;

    // Validaciones
    const validationErrors = [];
    const invalidValues = ['string', 'test', 'null', 'undefined', ''];
    const localidadVal = localidad ? localidad.trim().toLowerCase() : '';
    const provinciaVal = provincia ? provincia.trim().toLowerCase() : '';

    if (!localidad || !validators.isValidLength(localidad.trim(), 2, 100) || invalidValues.includes(localidadVal)) {
      validationErrors.push({ field: 'localidad', message: 'La localidad es obligatoria, debe ser válida y tener entre 2 y 100 caracteres' });
    }

    if (!provincia || !validators.isValidLength(provincia.trim(), 2, 100) || invalidValues.includes(provinciaVal)) {
      validationErrors.push({ field: 'provincia', message: 'La provincia es obligatoria, debe ser válida y tener entre 2 y 100 caracteres' });
    }

    if (direccion && !validators.isValidLength(direccion.trim(), 5, 255)) {
      validationErrors.push({ field: 'direccion', message: 'La dirección debe tener entre 5 y 255 caracteres' });
    }

    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const ubicacion = await Ubicacion.create({
      localidad: validators.sanitizeString(localidad),
      provincia: validators.sanitizeString(provincia),
      direccion: direccion ? validators.sanitizeString(direccion) : null
    });

    return ResponseService.created(res, ubicacion, 'Ubicación creada exitosamente');

  } catch (error) {
    console.error('Error al crear ubicación:', error);
    return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
},

    // PUT /ubicaciones/:id: Actualiza una ubicación (solo admin)
    async updateUbicacion(req, res) {
        try {
            const { id } = req.params;
            const { localidad, provincia, direccion } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ field: 'id', message: 'ID debe ser un número entero positivo' }]);
            }

            const ubicacion = await Ubicacion.findByPk(id);
            
            if (!ubicacion) {
                return ResponseService.notFound(res, 'Ubicación');
            }

            // Validaciones
            const validationErrors = [];

            if (localidad && !validators.isValidLength(localidad.trim(), 2, 100)) {
                validationErrors.push({ field: 'localidad', message: 'La localidad debe tener entre 2 y 100 caracteres' });
            }

            if (provincia && !validators.isValidLength(provincia.trim(), 2, 100)) {
                validationErrors.push({ field: 'provincia', message: 'La provincia debe tener entre 2 y 100 caracteres' });
            }

            if (direccion && !validators.isValidLength(direccion.trim(), 5, 255)) {
                validationErrors.push({ field: 'direccion', message: 'La dirección debe tener entre 5 y 255 caracteres' });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            const updateData = {};
            if (localidad) updateData.localidad = validators.sanitizeString(localidad);
            if (provincia) updateData.provincia = validators.sanitizeString(provincia);
            if (direccion !== undefined) updateData.direccion = direccion ? validators.sanitizeString(direccion) : null;

            await ubicacion.update(updateData);

            return ResponseService.updated(res, ubicacion, 'Ubicación actualizada exitosamente');

        } catch (error) {
            console.error('Error al actualizar ubicación:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // DELETE /ubicaciones/:id: Elimina una ubicación (solo admin)
    async deleteUbicacion(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ field: 'id', message: 'ID debe ser un número entero positivo' }]);
            }

            const ubicacion = await Ubicacion.findByPk(id);
            
            if (!ubicacion) {
                return ResponseService.notFound(res, 'Ubicación');
            }

            // Verificar si la ubicación está siendo utilizada
            const { Cliente, Prestador, SolicitudServicio } = require('../Models/Index');
            
            const [clientesCount, prestadoresCount, solicitudesCount] = await Promise.all([
                Cliente.count({ where: { id_ubicacion: id } }),
                Prestador.count({ where: { id_ubicacion: id } }),
                SolicitudServicio.count({ where: { id_ubicacion: id } })
            ]);

            if (clientesCount > 0 || prestadoresCount > 0 || solicitudesCount > 0) {
                return ResponseService.error(res, 'No se puede eliminar la ubicación porque está siendo utilizada', HTTP_STATUS.CONFLICT);
            }

            await ubicacion.destroy();

            return ResponseService.deleted(res, 'Ubicación eliminada exitosamente');

        } catch (error) {
            console.error('Error al eliminar ubicación:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};