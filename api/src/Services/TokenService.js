const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiration, resetTokenExpiration } = require('../config/auth');

module.exports = {
    // Genera un token de autenticación para el login
    generateAuthToken(userData) {
        return jwt.sign(
            { 
                id_usuario: userData.id_usuario,
                correo: userData.correo,
                id_rol: userData.id_rol,
                rol: userData.rol || userData.Rol?.nombre,
                id_prestador: userData.id_prestador || null,
                id_cliente: userData.id_cliente || null,
                nombre_completo: userData.nombre_completo || null
            },
            jwtSecret,
            { expiresIn: jwtExpiration }
        );
    },

    // Genera un token de recuperación de contraseña
    generatePasswordResetToken(usuario) {
        // hash parcial de la contraseña para mayor seguridad
        const passwordHash = usuario.contrasena.substring(0, 10);
        
        return jwt.sign(
            { 
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                purpose: 'password-reset',
                pwd_hash: passwordHash
            },
            jwtSecret,
            { expiresIn: resetTokenExpiration }
        );
    },

    // Verifica y decodifica el token de autenticación
    verifyAuthToken(token) {
        try {
            return jwt.verify(token, jwtSecret);
        } catch (error) {
            throw error;
        }
    },

    // Verifica y decodifica token de recuperación
    verifyResetToken(token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            
            if (decoded.purpose !== 'password-reset') {
                throw new Error('Token inválido');
            }
            
            return decoded;
        } catch (error) {
            throw error;
        }
    }
};