const UserService = require('../Services/UserService');

module.exports = {
    // GET /auth/me: Obtiene los datos del usuario autenticado
    async getMe(req, res) {
        try {
            const userData = await UserService.findByIdWithDetails(req.userId);

            if (!userData) {
                return res.status(404).json({ 
                    error: 'Usuario no encontrado.' 
                });
            }

            res.status(200).json(userData);
        } catch (error) {
            console.error('Error en getMe:', error);
            res.status(500).json({ 
                error: 'Error al obtener datos del usuario.' 
            });
        }
    },

    // POST /auth/logout: Cierra la sesión del usuario
    async logout(req, res) {
        try {
            // Registrar el evento de cierre de sesión
            console.log(`[LOGOUT] Usuario ${req.userId}`);
            
            res.status(200).json({ 
                message: 'Sesión cerrada correctamente.' 
            });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({ 
                error: 'Error al cerrar sesión.' 
            });
        }
    }
};