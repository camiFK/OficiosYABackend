const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

module.exports = {
    // Verifica que el usuario esté autenticado
    verifyToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'No se proporcionó token de autenticación.' 
            });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = {
                id_usuario: decoded.id_usuario,
                id_rol: decoded.id_rol,
                rol: decoded.rol,
                correo: decoded.correo,
                id_prestador: decoded.id_prestador || null, 
                id_cliente: decoded.id_cliente || null,
                nombre_completo: decoded.nombre_completo || null
            };

            req.userId = decoded.id_usuario;
            req.userRol = decoded.rol;
            req.userEmail = decoded.correo;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expirado. Por favor, inicie sesión nuevamente.' 
                });
            }
            return res.status(401).json({ 
                error: 'Token inválido.' 
            });
        }
    },

    //Verifica que el usuario tenga un rol específico
    requireRole(...roles) {
        return (req, res, next) => {
            if (!req.userRol || !roles.includes(req.userRol)) {
                return res.status(403).json({ 
                    error: 'No tiene permisos para acceder a este recurso.' 
                });
            }
            next();
        };
    }
};