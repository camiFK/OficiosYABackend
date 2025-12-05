const { Usuario, Rol } = require('../Models/Index');
const UserService = require('../Services/UserService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');


module.exports = {
    // GET /auth/me: Obtiene los datos del usuario autenticado
    async getMe(req, res) {
        try {
            const userData = await UserService.findByIdWithDetails(req.userId);

            if (!userData) {
                return ResponseService.notFound(res, 'Usuario');
            }

            return ResponseService.success(res, userData, 'Datos del usuario obtenidos exitosamente');
        } catch (error) {
            console.error('Error en getMe:', error);
            return ResponseService.error(res, 'Error al obtener datos del usuario.');
        }
    },

    // GET /auth/verify: Verifica si el token es válido
    async verifyToken(req, res) {
        try {
            // Si llega aca, el token ya fue validado por el middleware
            const userData = await UserService.findByIdWithDetails(req.userId);

            if (!userData) {
                return ResponseService.notFound(res, 'Usuario');
            }

            return ResponseService.success(res, { 
                valid: true,
                user: userData
            }, 'Token válido');
        } catch (error) {
            console.error('Error en verify token:', error);
            return ResponseService.error(res, 'Error al verificar token.');
        }
    },

    // POST /auth/logout: Cierra la sesión del usuario
    async logout(req, res) {
        try {
            return ResponseService.logoutSuccess(res);
        } catch (error) {
            console.error('Error en logout:', error);
            return ResponseService.error(res, 'Error al cerrar sesión.');
        }
    },

     async setupAdmin(req, res) {
        try {
            // Buscar el ID del Rol Administrador
            const rolAdmin = await Rol.findOne({ where: { nombre: 'Administrador' } });
            
            if (!rolAdmin) {
                return ResponseService.error(res, 'Error: El rol Administrador no existe en la BD. Ejecuta los seeds.', 500);
            }

            // Verificar si ya existe algún administrador
            const adminCount = await Usuario.count({
                where: { id_rol: rolAdmin.id_rol }
            });

            if (adminCount > 0) {
                return ResponseService.forbidden(res, 'ACCESO DENEGADO: El sistema ya cuenta con un administrador inicializado.');
            }

            // Si no existe, procedemos a crearlo
            const { correo, contrasena } = req.body;

            // Validaciones básicas
            if (!validators.isValidEmail(correo) || !validators.isValidPassword(contrasena)) {
                return ResponseService.validationError(res, [{ message: 'Credenciales inválidas' }]);
            }

            // Hashear contraseña
            const hashedPassword = await UserService.hashPassword(contrasena);

            // Crear el admin
            const newAdmin = await Usuario.create({
                correo: validators.sanitizeEmail(correo),
                contrasena: hashedPassword,
                id_rol: rolAdmin.id_rol,
                estado: 'activo'
            });

            return ResponseService.created(res, { correo: newAdmin.correo }, 'Administrador maestro creado con éxito. Ya puedes iniciar sesión.');

        } catch (error) {
            console.error('Error setup admin:', error);
            return ResponseService.error(res, 'Error al inicializar admin', 500);
        }
    }
};