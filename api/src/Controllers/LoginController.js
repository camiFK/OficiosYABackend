const UserService = require('../Services/UserService');
const TokenService = require('../Services/TokenService');
const validators = require('../Utils/validators');

module.exports = {
    // POST /auth/login: Autentica al usuario
    async login(req, res) {
        try {
            const { correo, contrasena } = req.body;
            if (!correo || !contrasena) {
                if (!correo && contrasena) {
                    return res.status(400).json({ 
                        error: 'Ingrese su correo electrónico.' 
                    });
                }
                if (correo && !contrasena) {
                    return res.status(400).json({ 
                        error: 'Ingrese su contraseña.' 
                    });
                }
                return res.status(400).json({ 
                    error: 'Ingrese su correo electrónico y contraseña.' 
                });
            }

            // Validar formato del correo
            if (!validators.isValidEmail(correo)) {
                return res.status(400).json({ 
                    error: validators.getEmailErrorMessage() 
                });
            }

            const usuario = await UserService.findByEmail(correo);

            // Verificar que el usuario exista
            if (!usuario) {
                return res.status(401).json({ 
                    error: 'Correo o contraseña incorrectos.'
                });
            }

            // Verificar que el usuario no esté bloqueado
            if (usuario.estado === 'bloqueado') {
                return res.status(403).json({ 
                    error: 'Su cuenta se encuentra bloqueada. Contacte al administrador.' 
                });
            }

            // Verificar la contraseña
            const isPasswordValid = await UserService.verifyPassword(contrasena, usuario.contrasena);
            
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    error: 'Correo o contraseña incorrectos.'
                });
            }

            // Crear token JWT
            const token = TokenService.generateAuthToken({
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                id_rol: usuario.id_rol,
                rol: usuario.rol.nombre
            });

            // Obtener datos del usuario según su rol
            const { userData, redirectUrl } = await UserService.getUserDataForLogin(usuario);

            // Registrar evento
            console.log(`[LOGIN] Usuario ${usuario.id_usuario} - ${correo} - Rol: ${usuario.rol.nombre}`);

            
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                usuario: userData,
                redirect: redirectUrl
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                error: 'No fue posible iniciar sesión. Intente nuevamente más tarde.' 
            });
        }
    }
};