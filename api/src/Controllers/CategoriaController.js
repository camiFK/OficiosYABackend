const { Categoria, PrestadorCategoria } = require('../Models/Index');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, TEXT_LIMITS, PAGINATION } = require('../Utils/constants');

module.exports = {
    // POST /categorias: Crea una nueva categoría
    async createCategoria(req, res) {
        try {
            const { nombre, descripcion } = req.body;

            // Validaciones
            const validationErrors = [];

            if (!nombre || !validators.isValidLength(nombre.trim(), 2, 100)) {
                validationErrors.push({ 
                    field: 'nombre', 
                    message: 'El nombre es obligatorio y debe tener entre 2 y 100 caracteres' 
                });
            }

            if (!descripcion || !validators.isValidLength(descripcion.trim(), 10, 500)) {
                validationErrors.push({ 
                    field: 'descripcion', 
                    message: 'La descripción es obligatoria y debe tener entre 10 y 500 caracteres' 
                });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategoria = await Categoria.findOne({
                where: { nombre: nombre.trim() }
            });

            if (existingCategoria) {
                return ResponseService.conflict(res, 'Ya existe una categoría con ese nombre');
            }

            const categoria = await Categoria.create({
                nombre: validators.sanitizeString(nombre),
                descripcion: validators.sanitizeString(descripcion)
            });

            return ResponseService.created(res, categoria, 'Categoría creada exitosamente');

        } catch (error) {
            console.error('Error al crear categoría:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /categorias: Obtiene todas las categorías con paginación opcional
    async getAllCategorias(req, res) {
        try {
            const { page, limit, search } = req.query;
            
            if (page || limit) {
                const pageNum = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
                const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT));
                const offset = (pageNum - 1) * limitNum;

                const whereClause = search ? {
                    [require('sequelize').Op.or]: [
                        { nombre: { [require('sequelize').Op.like]: `%${search}%` } },
                        { descripcion: { [require('sequelize').Op.like]: `%${search}%` } }
                    ]
                } : {};

                const result = await Categoria.findAndCountAll({
                    where: whereClause,
                    order: [['nombre', 'ASC']],
                    limit: limitNum,
                    offset
                });

                return ResponseService.paginated(res, result.rows, {
                    page: pageNum,
                    limit: limitNum,
                    total: result.count
                }, SUCCESS_MESSAGES.DATA_RETRIEVED);
            } else {
                const whereClause = search ? {
                    [require('sequelize').Op.or]: [
                        { nombre: { [require('sequelize').Op.like]: `%${search}%` } },
                        { descripcion: { [require('sequelize').Op.like]: `%${search}%` } }
                    ]
                } : {};

                const categorias = await Categoria.findAll({
                    where: whereClause,
                    order: [['nombre', 'ASC']]
                });
                
                // Formatear datos para compatibilidad con frontend
                const categoriasFormateadas = categorias.map(cat => cat.nombre);
                
                return ResponseService.success(res, {
                    categorias: categoriasFormateadas,
                    categoriasCompletas: categorias
                }, SUCCESS_MESSAGES.DATA_RETRIEVED);
            }
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /categorias/:id: Obtiene una categoría por ID
    async getCategoriaById(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const categoria = await Categoria.findByPk(id);
            
            if (!categoria) {
                return ResponseService.notFound(res, 'Categoría');
            }

            return ResponseService.success(res, categoria, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener categoría:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // PUT /categorias/:id: Actualiza una categoría
    async updateCategoria(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const categoria = await Categoria.findByPk(id);
            if (!categoria) {
                return ResponseService.notFound(res, 'Categoría');
            }

            // Validaciones
            const validationErrors = [];

            if (nombre && !validators.isValidLength(nombre.trim(), 2, 100)) {
                validationErrors.push({ 
                    field: 'nombre', 
                    message: 'El nombre debe tener entre 2 y 100 caracteres' 
                });
            }

            if (descripcion && !validators.isValidLength(descripcion.trim(), 10, 500)) {
                validationErrors.push({ 
                    field: 'descripcion', 
                    message: 'La descripción debe tener entre 10 y 500 caracteres' 
                });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            // Verificar nombre único si se está actualizando
            if (nombre && nombre.trim() !== categoria.nombre) {
                const existingCategoria = await Categoria.findOne({
                    where: { 
                        nombre: nombre.trim(),
                        id_categoria: { [require('sequelize').Op.ne]: id }
                    }
                });

                if (existingCategoria) {
                    return ResponseService.conflict(res, 'Ya existe una categoría con ese nombre');
                }
            }

            const updateData = {};
            if (nombre) updateData.nombre = validators.sanitizeString(nombre);
            if (descripcion) updateData.descripcion = validators.sanitizeString(descripcion);

            await categoria.update(updateData);

            return ResponseService.updated(res, categoria, 'Categoría actualizada exitosamente');

        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // DELETE /categorias/:id: Elimina una categoría
    async deleteCategoria(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const categoria = await Categoria.findByPk(id);
            if (!categoria) {
                return ResponseService.notFound(res, 'Categoría');
            }

            // Verificar si la categoría está siendo utilizada
            const prestadoresCount = await PrestadorCategoria.count({ 
                where: { id_categoria: id } 
            });

            if (prestadoresCount > 0) {
                return ResponseService.error(
                    res, 
                    'No se puede eliminar la categoría porque está siendo utilizada por prestadores', 
                    HTTP_STATUS.CONFLICT
                );
            }

            await categoria.destroy();

            return ResponseService.deleted(res, 'Categoría eliminada exitosamente');

        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /categorias/:id/prestadores: Obtiene prestadores de una categoría
    async getPrestadoresByCategoria(req, res) {
        try {
            const { id } = req.params;
            const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const categoria = await Categoria.findByPk(id);
            if (!categoria) {
                return ResponseService.notFound(res, 'Categoría');
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const result = await categoria.getPrestadores({
                include: [{
                    association: 'usuario',
                    attributes: { exclude: ['contrasena'] }
                }, {
                    association: 'ubicacion'
                }],
                limit: limitNum,
                offset,
                order: [['fecha_alta', 'DESC']]
            });

            const total = await categoria.countPrestadores();

            return ResponseService.paginated(res, result, {
                page: pageNum,
                limit: limitNum,
                total
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener prestadores de categoría:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};