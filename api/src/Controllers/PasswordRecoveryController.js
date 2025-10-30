const UserService = require('../Services/UserService');
const TokenService = require('../Services/TokenService');
const EmailService = require('../Services/EmailService');
const validators = require('../Utils/validators');

module.exports = {
    // POST /auth/forgot-password: Solicita recuperación de contraseña
    async forgotPassword(req, res) {
        try {
            const { correo } = req.body;
            
            if (!correo) {
                return res.status(400).json({ 
                    error: 'Ingrese su correo electrónico.' 
                });
            }

            if (!validators.isValidEmail(correo)) {
                return res.status(400).json({ 
                    error: validators.getEmailErrorMessage() 
                });
            }

            const usuario = await UserService.findByEmail(correo);
            const mensajeGenerico = 'Si el correo ingresado está registrado, recibirá un email con instrucciones para restablecer su contraseña.';

            if (!usuario) {
                return res.status(200).json({ message: mensajeGenerico });
            }

            // Verificar que el usuario no esté bloqueado
            if (usuario.estado === 'bloqueado') {
                return res.status(403).json({ 
                    error: 'Su cuenta se encuentra bloqueada. Contacte al administrador.' 
                });
            }

            const resetToken = TokenService.generatePasswordResetToken(usuario);

            // Enviar email con el enlace de recuperación
            await EmailService.sendPasswordResetEmail(correo, resetToken);

            // Registrar evento
            console.log(`[RECUPERACIÓN] Solicitud - Usuario: ${usuario.id_usuario}`);

            res.status(200).json({ 
                message: mensajeGenerico,
                // Para pruebas, hay que el token en la respuesta
                dev_token: process.env.NODE_ENV === 'development' ? resetToken : undefined
            });

        } catch (error) {
            console.error('Error en forgot-password:', error);
            res.status(500).json({ 
                error: 'No fue posible enviar el correo. Intente nuevamente más tarde.' 
            });
        }
    },

    // POST /auth/reset-password: Restablece la contraseña
    async resetPassword(req, res) {
        try {
            const { token, nueva_contrasena, confirmar_contrasena } = req.body;

            if (!token) {
                return res.status(400).json({ 
                    error: 'Token no proporcionado.' 
                });
            }

            let decoded;
            try {
                decoded = TokenService.verifyResetToken(token);
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(400).json({ 
                        error: 'El enlace ha expirado.',
                        action: '/api/auth/forgot-password'
                    });
                }
                return res.status(400).json({ 
                    error: 'El enlace no es válido.',
                    action: '/api/auth/forgot-password'
                });
            }

            const usuario = await UserService.findByEmail(decoded.correo);
            
            if (!usuario) {
                return res.status(404).json({ 
                    error: 'Usuario no encontrado.' 
                });
            }

            // Verificar que el token no haya sido usado
            const currentPasswordHash = usuario.contrasena.substring(0, 10);
            if (currentPasswordHash !== decoded.pwd_hash) {
                return res.status(400).json({ 
                    error: 'El enlace ya ha sido utilizado o la contraseña fue cambiada.',
                    action: '/api/auth/forgot-password'
                });
            }

            // Verificar que el usuario no esté bloqueado
            if (usuario.estado === 'bloqueado') {
                return res.status(403).json({ 
                    error: 'Su cuenta se encuentra bloqueada. Contacte al administrador.' 
                });
            }

            if (!nueva_contrasena || !confirmar_contrasena) {
                return res.status(400).json({ 
                    error: 'Complete todos los campos obligatorios.' 
                });
            }

            if (!validators.isValidPassword(nueva_contrasena)) {
                return res.status(400).json({ 
                    error: validators.getPasswordErrorMessage() 
                });
            }

            if (!validators.passwordsMatch(nueva_contrasena, confirmar_contrasena)) {
                return res.status(400).json({ 
                    error: 'Las contraseñas no coinciden.' 
                });
            }

            // Verificar que la nueva contraseña no sea igual a la anterior
            const isSamePassword = await UserService.verifyPassword(nueva_contrasena, usuario.contrasena);
            if (isSamePassword) {
                return res.status(400).json({ 
                    error: 'La nueva contraseña debe ser diferente a la anterior.' 
                });
            }

            await UserService.updatePassword(usuario.id_usuario, nueva_contrasena);

            // Registrar evento
            console.log(`[RECUPERACIÓN] Contraseña restablecida - Usuario: ${usuario.id_usuario}`);

            res.status(200).json({
                message: 'Su contraseña se actualizó correctamente. Ahora puede iniciar sesión.',
                redirect: '/api/auth/login'
            });

        } catch (error) {
            console.error('Error en reset-password:', error);
            res.status(500).json({ 
                error: 'No fue posible restablecer la contraseña. Intente nuevamente más tarde.' 
            });
        }
    },

    // POST /auth/validate-reset-token: Valida si un token de recuperación es válido
    async validateResetToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ 
                    valid: false,
                    error: 'Token no proporcionado.' 
                });
            }

            // Intentar decodificar el token
            let decoded;
            try {
                decoded = TokenService.verifyResetToken(token);
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(400).json({ 
                        valid: false,
                        error: 'El enlace ha expirado.' 
                    });
                }
                return res.status(400).json({ 
                    valid: false,
                    error: 'El enlace no es válido.' 
                });
            }

            // Verificar que el usuario exista y el token no haya sido usado
            const usuario = await UserService.findByEmail(decoded.correo);
            
            if (!usuario) {
                return res.status(400).json({ 
                    valid: false,
                    error: 'Usuario no encontrado.' 
                });
            }

            // Verificar que la contraseña no haya cambiado
            const currentPasswordHash = usuario.contrasena.substring(0, 10);
            if (currentPasswordHash !== decoded.pwd_hash) {
                return res.status(400).json({ 
                    valid: false,
                    error: 'El enlace ya ha sido utilizado.' 
                });
            }

            res.status(200).json({ 
                valid: true,
                correo: usuario.correo,
                message: 'Token válido. Puede continuar con el restablecimiento.' 
            });

        } catch (error) {
            console.error('Error en validate-reset-token:', error);
            res.status(500).json({ 
                valid: false,
                error: 'Error al validar el token.' 
            });
        }
    }
};