const UserService = require('../Services/UserService');
const TokenService = require('../Services/TokenService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');

module.exports = {
    // POST /auth/login: Autentica al usuario
    async login(req, res) {
        try {
            const { correo, contrasena } = req.body;
            if (!correo || !contrasena) {
                if (!correo && contrasena) {
                    return ResponseService.validationError(res, 
                        { correo: 'Requerido' }, 
                        'Ingrese su correo electrónico.'
                    );
                }
                if (correo && !contrasena) {
                    return ResponseService.validationError(res, 
                        { contrasena: 'Requerido' }, 
                        'Ingrese su contraseña.'
                    );
                }
                return ResponseService.validationError(res, 
                    { correo: 'Requerido', contrasena: 'Requerido' }, 
                    'Ingrese su correo electrónico y contraseña.'
                );
            }

            // Validar formato del correo
            if (!validators.isValidEmail(correo)) {
                return ResponseService.validationError(res, 
                    { correo: validators.getEmailErrorMessage() }, 
                    'Email inválido'
                );
            }

            const usuario = await UserService.findByEmail(correo);

            // Verificar que el usuario exista
            if (!usuario) {
                return ResponseService.unauthorized(res, 'Correo o contraseña incorrectos.');
            }

            // Verificar que el usuario no esté bloqueado
            if (usuario.estado === 'bloqueado') {
                return ResponseService.forbidden(res, 'Su cuenta se encuentra bloqueada. Contacte al administrador.');
            }

            // Verificar la contraseña
            const isPasswordValid = await UserService.verifyPassword(contrasena, usuario.contrasena);
            
            if (!isPasswordValid) {
                return ResponseService.unauthorized(res, 'Correo o contraseña incorrectos.');
            }

            // Obtener datos del usuario según su rol
            const { userData, redirectUrl } = await UserService.getUserDataForLogin(usuario);

            // Agregar id_rol al userData para el token
            userData.id_rol = usuario.id_rol;

            // Crear token JWT
            const token = TokenService.generateAuthToken(userData);

            return ResponseService.loginSuccess(res, userData, token, redirectUrl);

        } catch (error) {
            console.error('Error en login:', error);
            return ResponseService.error(res, 'No fue posible iniciar sesión. Intente nuevamente más tarde.');
        }
    }
};