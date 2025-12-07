const { Usuario, Rol, Cliente, Prestador, Ubicacion, AccionAdministrador } = require('../Models/Index');
const UserService = require('../Services/UserService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION, USUARIO_ESTADOS } = require('../Utils/constants');

module.exports = {
  // POST /usuarios: Crea un nuevo usuario (solo admin)
  async createUser(req, res) {
    try {
      if (req.userRol !== 'Administrador') {
        return ResponseService.forbidden(res, 'Solo administradores pueden crear usuarios');
      }

      const { correo, contrasena, id_rol, estado } = req.body;
      const validationErrors = [];

      if (!correo || !validators.isValidEmail(correo)) validationErrors.push({ field: 'correo', message: validators.getEmailErrorMessage() });
      if (!contrasena || !validators.isValidPassword(contrasena)) validationErrors.push({ field: 'contrasena', message: validators.getPasswordErrorMessage() });
      if (!id_rol || !validators.isValidPositiveInteger(parseInt(id_rol))) validationErrors.push({ field: 'id_rol', message: 'ID de rol debe ser positivo' });
      if (estado && !validators.isValidUsuarioEstado(estado)) validationErrors.push({ field: 'estado', message: 'Estado inválido' });

      if (validationErrors.length > 0) return ResponseService.validationError(res, validationErrors);

      const existingUser = await UserService.findByEmail(correo);
      if (existingUser) return ResponseService.conflict(res, 'El correo ya está registrado');

      const hashedPassword = await UserService.hashPassword(contrasena);

      const user = await Usuario.create({
        correo: validators.sanitizeEmail(correo),
        contrasena: hashedPassword,
        id_rol,
        estado: estado || USUARIO_ESTADOS.ACTIVO
      });

      const userSafe = { ...user.toJSON() };
      delete userSafe.contrasena;

      return ResponseService.created(res, userSafe, 'Usuario creado exitosamente');
    } catch (error) {
      console.error(error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // GET /usuarios
  async getAllUsers(req, res) {
    try {
      const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, rol, estado, busqueda } = req.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const whereClause = {};
      
      const includeOptions = [
        { 
            model: Rol, 
            as: 'rol', 
            attributes: ['id_rol', 'nombre'] 
        },
        {
            model: Cliente,
            as: 'cliente',
            attributes: ['nombre_completo']
        },
        {
            model: Prestador,
            as: 'prestador',
            attributes: ['nombre_completo']
        }
      ];

      if (rol) includeOptions[0].where = { nombre: rol };
      if (estado) whereClause.estado = estado;
      if (busqueda) whereClause.correo = { [require('sequelize').Op.like]: `%${busqueda}%` };

      const result = await Usuario.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        attributes: { exclude: ['contrasena'] },
        order: [['fecha_registro', 'DESC']],
        limit: limitNum,
        offset
      });

      return ResponseService.paginated(res, result.rows, { page: pageNum, limit: limitNum, total: result.count }, SUCCESS_MESSAGES.DATA_RETRIEVED);
    } catch (error) {
      console.error(error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // GET /usuarios/:id
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await Usuario.findByPk(id, {
        include: [
          { model: Rol, as: 'rol', attributes: ['nombre'] },
          { model: Cliente, as: 'cliente', include: ['ubicacion'] },
          { model: Prestador, as: 'prestador', include: ['ubicacion'] }
        ],
        attributes: { exclude: ['contrasena'] }
      });
      if (!user) return ResponseService.notFound(res, 'Usuario');
      return ResponseService.success(res, user);
    } catch (error) {
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
    }
  },

  // PUT /usuarios/:id
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { correo, estado, id_rol } = req.body;
      
      const user = await Usuario.findByPk(id);
      if (!user) return ResponseService.notFound(res, 'Usuario');

      if (correo && correo !== user.correo) {
         const exists = await UserService.findByEmail(correo);
         if(exists) return ResponseService.conflict(res, 'Correo en uso');
      }

      await user.update({ correo, estado, id_rol });
      return ResponseService.updated(res, user, 'Usuario actualizado');
    } catch (error) {
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, 500);
    }
  },

  // PUT /usuarios/:id/estado
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body; 
      const adminId = req.user.id_usuario; 

      if (!validators.isValidPositiveInteger(parseInt(id))) return ResponseService.validationError(res, [{ field: 'id', message: 'ID inválido' }]);
      if (!estado || !validators.isValidUsuarioEstado(estado)) return ResponseService.validationError(res, [{ field: 'estado', message: 'Estado inválido' }]);
       if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 10) {
         return ResponseService.validationError(res, [{ field: 'motivo', message: 'El motivo es obligatorio y debe tener al menos 10 caracteres.' }]);
       }

      const user = await Usuario.findByPk(id);
      if (!user) return ResponseService.notFound(res, 'Usuario');

      await user.update({ estado });

      if (estado === 'bloqueado' || estado === 'activo') {
          if (AccionAdministrador) {
            await AccionAdministrador.create({
              id_admin: adminId, 
              id_usuario_afectado: id,
              tipo_accion: estado === 'bloqueado' ? 'BLOQUEO' : 'REACTIVACION',
              descripcion: motivo || `Cambio de estado a ${estado}`,
              fecha_hora: new Date()
            });
          }
      }

      return ResponseService.updated(res, { id, estado }, `Usuario ${estado} exitosamente`);
    } catch (error) {
      console.error('Error update status:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // GET /usuarios/historial/moderacion
  async getHistorialModeracion(req, res) {
    try {
        if (!AccionAdministrador) return ResponseService.error(res, 'Modelo no configurado', 500);

        const historial = await AccionAdministrador.findAll({
            include: [
                { model: Usuario, as: 'admin', attributes: ['correo'] },
                { model: Usuario, as: 'usuario_afectado', attributes: ['correo'] }
            ],
            order: [['fecha_hora', 'DESC']]
        });
        return ResponseService.success(res, historial);
    } catch (error) {
        console.error('Error historial:', error);
        return ResponseService.error(res, 'Error al obtener historial', 500);
    }
  },
  
  // Método para borrar historial
  async clearHistorialModeracion(req, res) {
    try {
      if (!AccionAdministrador) return ResponseService.error(res, 'Modelo no configurado', 500);
      await AccionAdministrador.destroy({ where: {}, truncate: true });
      return ResponseService.success(res, null, 'Historial eliminado');
    } catch (error) {
      return ResponseService.error(res, 'Error al borrar historial', 500);
    }
  },

  // PUT /usuarios/:id/password
  async updateUserPassword(req, res) {
      try {
        const { id } = req.params;
        const { nueva_contrasena } = req.body;
        if (!validators.isValidPassword(nueva_contrasena)) return ResponseService.validationError(res, [{ field: 'password', message: 'Contraseña inválida' }]);
        await UserService.updatePassword(id, nueva_contrasena);
        return ResponseService.success(res, null, 'Contraseña actualizada');
      } catch (e) { return ResponseService.error(res, 'Error password', 500); }
  }
};