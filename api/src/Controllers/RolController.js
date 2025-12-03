const { Rol, Usuario } = require('../Models/Index');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, ROLES } = require('../Utils/constants');

module.exports = {
    // POST /roles: Crea un nuevo rol (solo admin)
    async createRole(req, res) {
        try {
            // Verificar que sea administrador
            if (req.userRol !== 'Administrador') {
                return ResponseService.forbidden(res, 'Solo administradores pueden crear roles');
            }

            const { nombre } = req.body;

            if (!nombre || !validators.isValidLength(nombre.trim(), 2, 50)) {
                return ResponseService.validationError(res, [{ 
                    field: 'nombre', 
                    message: 'El nombre es obligatorio y debe tener entre 2 y 50 caracteres' 
                }]);
            }

            // Verificar si ya existe el rol
            const existingRol = await Rol.findOne({
                where: { nombre: nombre.trim() }
            });

            if (existingRol) {
                return ResponseService.conflict(res, 'Ya existe un rol con ese nombre');
            }

            const rol = await Rol.create({ 
                nombre: validators.sanitizeString(nombre)
            });

            return ResponseService.created(res, rol, 'Rol creado exitosamente');

        } catch (error) {
            console.error('Error al crear rol:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /roles: Obtiene todos los roles
    async getAllRoles(req, res) {
        try {
            // Verificar que sea administrador
            if (req.userRol !== 'Administrador') {
                return ResponseService.forbidden(res, 'Solo administradores pueden ver roles');
            }

            const roles = await Rol.findAll({
                attributes: ['id_rol', 'nombre'],
                order: [['nombre', 'ASC']]
            });

            return ResponseService.success(res, roles, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener roles:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /roles/:id: Obtiene un rol por ID
    async getRoleById(req, res) {
        try {
            // Verificar que sea administrador
            if (req.userRol !== 'Administrador') {
                return ResponseService.forbidden(res, 'Solo administradores pueden ver roles');
            }

            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const rol = await Rol.findByPk(id, {
                attributes: ['id_rol', 'nombre']
            });

            if (!rol) {
                return ResponseService.notFound(res, 'Rol');
            }

            return ResponseService.success(res, rol, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener rol:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // PUT /roles/:id: Actualiza un rol (solo admin)
    async updateRole(req, res) {
        try {
            // Verificar que sea administrador
            if (req.userRol !== 'Administrador') {
                return ResponseService.forbidden(res, 'Solo administradores pueden actualizar roles');
            }

            const { id } = req.params;
            const { nombre } = req.body;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const rol = await Rol.findByPk(id);
            if (!rol) {
                return ResponseService.notFound(res, 'Rol');
            }

            // Verificar que no sea un rol del sistema que no se puede modificar
            const systemRoles = [ROLES.ADMINISTRADOR, ROLES.CLIENTE, ROLES.PRESTADOR];
            if (systemRoles.includes(rol.nombre)) {
                return ResponseService.error(
                    res, 
                    'No se puede modificar este rol del sistema', 
                    HTTP_STATUS.FORBIDDEN
                );
            }

            if (!nombre || !validators.isValidLength(nombre.trim(), 2, 50)) {
                return ResponseService.validationError(res, [{ 
                    field: 'nombre', 
                    message: 'El nombre es obligatorio y debe tener entre 2 y 50 caracteres' 
                }]);
            }

            // Verificar nombre único
            if (nombre.trim() !== rol.nombre) {
                const existingRol = await Rol.findOne({
                    where: { 
                        nombre: nombre.trim(),
                        id_rol: { [require('sequelize').Op.ne]: id }
                    }
                });

                if (existingRol) {
                    return ResponseService.conflict(res, 'Ya existe un rol con ese nombre');
                }
            }

            await rol.update({ 
                nombre: validators.sanitizeString(nombre)
            });

            return ResponseService.updated(res, rol, 'Rol actualizado exitosamente');

        } catch (error) {
            console.error('Error al actualizar rol:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // DELETE /roles/:id: Elimina un rol (solo admin)
    async deleteRole(req, res) {
        try {
            // Verificar que sea administrador
            if (req.userRol !== 'Administrador') {
                return ResponseService.forbidden(res, 'Solo administradores pueden eliminar roles');
            }

            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const rol = await Rol.findByPk(id);
            if (!rol) {
                return ResponseService.notFound(res, 'Rol');
            }

            // Verificar que no sea un rol del sistema que no se puede eliminar
            const systemRoles = [ROLES.ADMINISTRADOR, ROLES.CLIENTE, ROLES.PRESTADOR];
            if (systemRoles.includes(rol.nombre)) {
                return ResponseService.error(
                    res, 
                    'No se puede eliminar este rol del sistema', 
                    HTTP_STATUS.FORBIDDEN
                );
            }

            // Verificar si hay usuarios con este rol
            const usuariosCount = await Usuario.count({ 
                where: { id_rol: id } 
            });

            if (usuariosCount > 0) {
                return ResponseService.error(
                    res, 
                    `No se puede eliminar el rol porque hay ${usuariosCount} usuario(s) asignado(s) a él`, 
                    HTTP_STATUS.CONFLICT
                );
            }

            await rol.destroy();

            return ResponseService.deleted(res, 'Rol eliminado exitosamente');

        } catch (error) {
            console.error('Error al eliminar rol:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // GET /roles/:id/usuarios: Obtiene usuarios de un rol específico
    async getUsersByRole(req, res) {
        try {
            const { id } = req.params;

            if (!validators.isValidPositiveInteger(parseInt(id))) {
                return ResponseService.validationError(res, [{ 
                    field: 'id', 
                    message: 'ID debe ser un número entero positivo' 
                }]);
            }

            const rol = await Rol.findByPk(id);
            if (!rol) {
                return ResponseService.notFound(res, 'Rol');
            }

            const usuarios = await Usuario.findAll({
                where: { id_rol: id },
                attributes: { exclude: ['contrasena'] },
                order: [['fecha_registro', 'DESC']]
            });

            return ResponseService.success(res, {
                rol: rol,
                usuarios: usuarios,
                total: usuarios.length
            }, SUCCESS_MESSAGES.DATA_RETRIEVED);

        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error);
            return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
};