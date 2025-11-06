const { Usuario, Rol, Cliente, Prestador, Ubicacion } = require('../Models/Index');
const UserService = require('../Services/UserService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, PAGINATION, USUARIO_ESTADOS } = require('../Utils/constants');

module.exports = {
  // POST /usuarios: Crea un nuevo usuario (solo admin)
  async createUser(req, res) {
    try {
      const { correo, contrasena, id_rol, estado } = req.body;

      // Validaciones básicas
      const validationErrors = [];

      if (!correo || !validators.isValidEmail(correo)) {
        validationErrors.push({ 
          field: 'correo', 
          message: validators.getEmailErrorMessage() 
        });
      }

      if (!contrasena || !validators.isValidPassword(contrasena)) {
        validationErrors.push({ 
          field: 'contrasena', 
          message: validators.getPasswordErrorMessage() 
        });
      }

      if (!id_rol || !validators.isValidPositiveInteger(parseInt(id_rol))) {
        validationErrors.push({ 
          field: 'id_rol', 
          message: 'ID de rol debe ser un número entero positivo' 
        });
      }

      if (estado && !validators.isValidUsuarioEstado(estado)) {
        validationErrors.push({ 
          field: 'estado', 
          message: 'Estado de usuario inválido' 
        });
      }

      if (validationErrors.length > 0) {
        return ResponseService.validationError(res, validationErrors);
      }

      // Verificar que el correo no exista
      const existingUser = await UserService.findByEmail(correo);
      if (existingUser) {
        return ResponseService.conflict(res, 'El correo ya está registrado');
      }

      // Verificar que el rol exista
      const rol = await Rol.findByPk(id_rol);
      if (!rol) {
        return ResponseService.notFound(res, 'Rol');
      }

      // Crear usuario usando el servicio
      const hashedPassword = await UserService.hashPassword(contrasena);

      const user = await Usuario.create({
        correo: validators.sanitizeEmail(correo),
        contrasena: hashedPassword,
        id_rol,
        estado: estado || USUARIO_ESTADOS.ACTIVO
      });

      // Respuesta sin contraseña
      const userSafe = { ...user.toJSON() };
      delete userSafe.contrasena;

      return ResponseService.created(res, userSafe, 'Usuario creado exitosamente');

    } catch (error) {
      console.error('Error al crear usuario:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // GET /usuarios: Obtiene todos los usuarios con paginación y filtros
  async getAllUsers(req, res) {
    try {
      const { 
        page = PAGINATION.DEFAULT_PAGE, 
        limit = PAGINATION.DEFAULT_LIMIT,
        rol,
        estado,
        busqueda 
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const whereClause = {};
      const includeOptions = [{
        model: Rol,
        as: 'rol',
        attributes: ['id_rol', 'nombre']
      }];

      // Filtro por rol
      if (rol) {
        includeOptions[0].where = { nombre: rol };
      }

      // Filtro por estado
      if (estado && validators.isValidUsuarioEstado(estado)) {
        whereClause.estado = estado;
      }

      // Filtro por búsqueda en correo
      if (busqueda && busqueda.trim().length > 0) {
        const searchTerm = `%${busqueda.trim()}%`;
        whereClause.correo = { [require('sequelize').Op.like]: searchTerm };
      }

      const result = await Usuario.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        attributes: { exclude: ['contrasena'] },
        order: [['fecha_registro', 'DESC']],
        limit: limitNum,
        offset
      });

      return ResponseService.paginated(res, result.rows, {
        page: pageNum,
        limit: limitNum,
        total: result.count
      }, SUCCESS_MESSAGES.DATA_RETRIEVED);

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // GET /usuarios/:id: Obtiene un usuario por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!validators.isValidPositiveInteger(parseInt(id))) {
        return ResponseService.validationError(res, [{ 
          field: 'id', 
          message: 'ID debe ser un número entero positivo' 
        }]);
      }

      const user = await Usuario.findByPk(id, {
        include: [
          {
            model: Rol,
            as: 'rol',
            attributes: ['id_rol', 'nombre']
          },
          {
            model: Cliente,
            as: 'cliente',
            required: false,
            include: [{
              model: Ubicacion,
              as: 'ubicacion',
              attributes: ['localidad', 'provincia']
            }]
          },
          {
            model: Prestador,
            as: 'prestador',
            required: false,
            include: [{
              model: Ubicacion,
              as: 'ubicacion',
              attributes: ['localidad', 'provincia']
            }]
          }
        ],
        attributes: { exclude: ['contrasena'] }
      });

      if (!user) {
        return ResponseService.notFound(res, 'Usuario');
      }

      return ResponseService.success(res, user, SUCCESS_MESSAGES.DATA_RETRIEVED);

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // PUT /usuarios/:id: Actualiza un usuario
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { correo, estado, id_rol } = req.body;

      if (!validators.isValidPositiveInteger(parseInt(id))) {
        return ResponseService.validationError(res, [{ 
          field: 'id', 
          message: 'ID debe ser un número entero positivo' 
        }]);
      }

      const user = await Usuario.findByPk(id);
      if (!user) {
        return ResponseService.notFound(res, 'Usuario');
      }

      // Validaciones
      const validationErrors = [];

      if (correo && !validators.isValidEmail(correo)) {
        validationErrors.push({ 
          field: 'correo', 
          message: validators.getEmailErrorMessage() 
        });
      }

      if (estado && !validators.isValidUsuarioEstado(estado)) {
        validationErrors.push({ 
          field: 'estado', 
          message: 'Estado de usuario inválido' 
        });
      }

      if (id_rol && !validators.isValidPositiveInteger(parseInt(id_rol))) {
        validationErrors.push({ 
          field: 'id_rol', 
          message: 'ID de rol debe ser un número entero positivo' 
        });
      }

      if (validationErrors.length > 0) {
        return ResponseService.validationError(res, validationErrors);
      }

      // Verificar correo único si se está actualizando
      if (correo && correo !== user.correo) {
        const existingUser = await Usuario.findOne({
          where: { 
            correo,
            id_usuario: { [require('sequelize').Op.ne]: id }
          }
        });

        if (existingUser) {
          return ResponseService.conflict(res, 'El correo ya está en uso');
        }
      }

      // Verificar rol si se está actualizando
      if (id_rol && id_rol !== user.id_rol) {
        const rol = await Rol.findByPk(id_rol);
        if (!rol) {
          return ResponseService.notFound(res, 'Rol');
        }
      }

      const updateData = {};
      if (correo) updateData.correo = validators.sanitizeEmail(correo);
      if (estado) updateData.estado = estado;
      if (id_rol) updateData.id_rol = id_rol;

      await user.update(updateData);

      // Obtener usuario actualizado sin contraseña
      const updatedUser = await Usuario.findByPk(id, {
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['id_rol', 'nombre']
        }],
        attributes: { exclude: ['contrasena'] }
      });

      return ResponseService.updated(res, updatedUser, 'Usuario actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // PUT /usuarios/:id/estado: Cambia el estado de un usuario
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!validators.isValidPositiveInteger(parseInt(id))) {
        return ResponseService.validationError(res, [{ 
          field: 'id', 
          message: 'ID debe ser un número entero positivo' 
        }]);
      }

      if (!estado || !validators.isValidUsuarioEstado(estado)) {
        return ResponseService.validationError(res, [{ 
          field: 'estado', 
          message: 'Estado de usuario inválido' 
        }]);
      }

      const user = await Usuario.findByPk(id);
      if (!user) {
        return ResponseService.notFound(res, 'Usuario');
      }

      await user.update({ estado });

      const message = estado === USUARIO_ESTADOS.ACTIVO ? 'Usuario activado exitosamente' : 
                      estado === USUARIO_ESTADOS.BLOQUEADO ? 'Usuario bloqueado exitosamente' : 
                      'Usuario desactivado exitosamente';

      return ResponseService.updated(res, { id, estado }, message);

    } catch (error) {
      console.error('Error al actualizar estado del usuario:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // PUT /usuarios/:id/password: Cambia la contraseña de un usuario (solo admin)
  async updateUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { nueva_contrasena } = req.body;

      if (!validators.isValidPositiveInteger(parseInt(id))) {
        return ResponseService.validationError(res, [{ 
          field: 'id', 
          message: 'ID debe ser un número entero positivo' 
        }]);
      }

      if (!nueva_contrasena || !validators.isValidPassword(nueva_contrasena)) {
        return ResponseService.validationError(res, [{ 
          field: 'nueva_contrasena', 
          message: validators.getPasswordErrorMessage() 
        }]);
      }

      const user = await Usuario.findByPk(id);
      if (!user) {
        return ResponseService.notFound(res, 'Usuario');
      }

      await UserService.updatePassword(id, nueva_contrasena);

      return ResponseService.success(res, null, 'Contraseña actualizada exitosamente');

    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return ResponseService.error(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};