const UserService = require('../Services/UserService');
const TokenService = require('../Services/TokenService');
const EmailService = require('../Services/EmailService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, USUARIO_ESTADOS } = require('../Utils/constants');

module.exports = {
    // POST /auth/forgot-password: Solicita recuperación de contraseña
    async forgotPassword(req, res) {
        try {
            const { correo } = req.body;
            
            if (!correo) {
                return ResponseService.validationError(res, [{ 
                    field: 'correo', 
                    message: 'Ingrese su correo electrónico' 
                }]);
            }

            if (!validators.isValidEmail(correo)) {
                return ResponseService.validationError(res, [{ 
                    field: 'correo', 
                    message: validators.getEmailErrorMessage() 
                }]);
            }

            const usuario = await UserService.findByEmail(validators.sanitizeEmail(correo));
            const mensajeGenerico = 'Si el correo ingresado está registrado, recibirá un email con instrucciones para restablecer su contraseña.';

            if (!usuario) {
                return ResponseService.success(res, null, mensajeGenerico);
            }

            // Verificar que el usuario no esté bloqueado
            if (usuario.estado === USUARIO_ESTADOS.BLOQUEADO) {
                return ResponseService.forbidden(res, 'Su cuenta se encuentra bloqueada. Contacte al administrador.');
            }

            // Verificar que el usuario esté activo
            if (usuario.estado === USUARIO_ESTADOS.INACTIVO) {
                return ResponseService.error(res, 'Su cuenta se encuentra desactivada. Contacte al administrador.', HTTP_STATUS.FORBIDDEN);
            }

            try {
                const resetToken = TokenService.generatePasswordResetToken(usuario);

                // Enviar email con el enlace de recuperación
                await EmailService.sendPasswordResetEmail(correo, resetToken);

                return ResponseService.success(res, {
                    // Solo incluir token en desarrollo para testing
                    ...(process.env.NODE_ENV === 'development' && { dev_token: resetToken })
                }, mensajeGenerico);

            } catch (emailError) {
                console.error('Error enviando email de recuperación:', emailError);
                
                // No revelar error de email por seguridad
                return ResponseService.success(res, null, mensajeGenerico);
            }

        } catch (error) {
            console.error('Error en forgot-password:', error);
            return ResponseService.error(res, 'No fue posible procesar la solicitud. Intente nuevamente más tarde.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /auth/reset-password: Restablece la contraseña
    async resetPassword(req, res) {
        try {
            const { token, nueva_contrasena, confirmar_contrasena } = req.body;

            // Validar campos requeridos
            const errors = [];

            if (!token) {
                errors.push({ field: 'token', message: 'Token no proporcionado' });
            }

            if (!nueva_contrasena) {
                errors.push({ field: 'nueva_contrasena', message: 'Nueva contraseña es requerida' });
            }

            if (!confirmar_contrasena) {
                errors.push({ field: 'confirmar_contrasena', message: 'Confirmación de contraseña es requerida' });
            }

            if (errors.length > 0) {
                return ResponseService.validationError(res, errors);
            }

            // Validar formato de contraseña
            if (!validators.isValidPassword(nueva_contrasena)) {
                return ResponseService.validationError(res, [{ 
                    field: 'nueva_contrasena', 
                    message: validators.getPasswordErrorMessage() 
                }]);
            }

            // Verificar que las contraseñas coincidan
            if (!validators.passwordsMatch(nueva_contrasena, confirmar_contrasena)) {
                return ResponseService.validationError(res, [{ 
                    field: 'confirmar_contrasena', 
                    message: 'Las contraseñas no coinciden' 
                }]);
            }

            // Verificar el token
            let decoded;
            try {
                decoded = TokenService.verifyResetToken(token);
            } catch (tokenError) {
                console.error('Error verificando token:', tokenError);
                
                if (tokenError.name === 'TokenExpiredError') {
                    return ResponseService.error(res, 'El enlace ha expirado. Solicite un nuevo enlace.', HTTP_STATUS.BAD_REQUEST, {
                        action: '/auth/forgot-password'
                    });
                }
                
                return ResponseService.error(res, 'El enlace no es válido. Solicite un nuevo enlace.', HTTP_STATUS.BAD_REQUEST, {
                    action: '/auth/forgot-password'
                });
            }

            const usuario = await UserService.findByEmail(decoded.correo);
            
            if (!usuario) {
                return ResponseService.notFound(res, 'Usuario no encontrado');
            }

            // Verificar que el token no haya sido usado
            const currentPasswordHash = usuario.contrasena.substring(0, 10);
            if (currentPasswordHash !== decoded.pwd_hash) {
                return ResponseService.error(res, 'El enlace ya ha sido utilizado o la contraseña fue cambiada.', HTTP_STATUS.BAD_REQUEST, {
                    action: '/auth/forgot-password'
                });
            }

            // Verificar estado del usuario
            if (usuario.estado === USUARIO_ESTADOS.BLOQUEADO) {
                return ResponseService.forbidden(res, 'Su cuenta se encuentra bloqueada. Contacte al administrador.');
            }

            if (usuario.estado === USUARIO_ESTADOS.INACTIVO) {
                return ResponseService.forbidden(res, 'Su cuenta se encuentra desactivada. Contacte al administrador.');
            }

            try {
                // Verificar que la nueva contraseña no sea igual a la anterior
                const isSamePassword = await UserService.verifyPassword(nueva_contrasena, usuario.contrasena);
                if (isSamePassword) {
                    return ResponseService.validationError(res, [{ 
                        field: 'nueva_contrasena', 
                        message: 'La nueva contraseña debe ser diferente a la anterior' 
                    }]);
                }

                // Sanitizar y actualizar contraseña
                const sanitizedPassword = validators.sanitizeString(nueva_contrasena);
                await UserService.updatePassword(usuario.id_usuario, sanitizedPassword);

                return ResponseService.success(res, {
                    redirect: '/auth/login'
                }, 'Su contraseña se actualizó correctamente. Ahora puede iniciar sesión.');

            } catch (updateError) {
                console.error('Error actualizando contraseña:', updateError);
                return ResponseService.error(res, 'Error actualizando la contraseña. Intente nuevamente.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            console.error('Error en reset-password:', error);
            return ResponseService.error(res, 'No fue posible restablecer la contraseña. Intente nuevamente más tarde.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    },

    // POST /auth/validate-reset-token: Valida si un token de recuperación es válido
    async validateResetToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return ResponseService.validationError(res, [{ 
                    field: 'token', 
                    message: 'Token no proporcionado' 
                }]);
            }

            // Intentar decodificar el token
            let decoded;
            try {
                decoded = TokenService.verifyResetToken(token);
            } catch (tokenError) {
                console.error('Error verificando token:', tokenError.name, tokenError.message);
                
                if (tokenError.name === 'TokenExpiredError') {
                    return ResponseService.error(res, 'El enlace ha expirado. Solicite uno nuevo.', HTTP_STATUS.BAD_REQUEST, { valid: false, errorType: 'TOKEN_EXPIRED' });
                }
                
                if (tokenError.name === 'JsonWebTokenError') {
                    return ResponseService.error(res, 'El enlace no es válido.', HTTP_STATUS.BAD_REQUEST, { valid: false, errorType: 'TOKEN_INVALID' });
                }
                
                return ResponseService.error(res, 'Error al validar el enlace.', HTTP_STATUS.BAD_REQUEST, { valid: false, errorType: 'TOKEN_ERROR' });
            }

            // Verificar que el usuario exista y el token no haya sido usado
            const usuario = await UserService.findByEmail(decoded.correo);
            
            if (!usuario) {
                return ResponseService.error(res, 'Usuario no encontrado.', HTTP_STATUS.BAD_REQUEST, { valid: false });
            }

            // Verificar estado del usuario
            if (usuario.estado === USUARIO_ESTADOS.BLOQUEADO) {
                return ResponseService.error(res, 'Su cuenta se encuentra bloqueada.', HTTP_STATUS.FORBIDDEN, { valid: false });
            }

            if (usuario.estado === USUARIO_ESTADOS.INACTIVO) {
                return ResponseService.error(res, 'Su cuenta se encuentra desactivada.', HTTP_STATUS.FORBIDDEN, { valid: false });
            }

            // Verificar que la contraseña no haya cambiado (seguridad adicional)
            const currentPasswordHash = usuario.contrasena.substring(0, 10);
            const tokenPasswordHash = decoded.pwd_hash;

            if (currentPasswordHash !== tokenPasswordHash) {
                return ResponseService.error(res, 'El enlace ya ha sido utilizado.', HTTP_STATUS.BAD_REQUEST, { valid: false });
            }

            return ResponseService.success(res, { 
                valid: true,
                correo: usuario.correo
            }, 'Token válido. Puede continuar con el restablecimiento.');

        } catch (error) {
            console.error('Error en validate-reset-token:', error);
            return ResponseService.error(res, 'Error al validar el token.', HTTP_STATUS.INTERNAL_SERVER_ERROR, { valid: false });
        }
    }
};