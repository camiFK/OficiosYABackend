const UserService = require('../Services/UserService');
const ResponseService = require('../Services/ResponseService');

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
    }
};