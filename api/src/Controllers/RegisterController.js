const UserService = require('../Services/UserService');
const EmailService = require('../Services/EmailService');
const validators = require('../Utils/validators');
const { Ubicacion } = require('../Models/Index');

module.exports = {
    // POST /auth/register: Registra un nuevo usuario
    async register(req, res) {
        try {
            const { 
                correo, 
                contrasena, 
                confirmar_contrasena,
                nombre_completo,
                id_ubicacion,
                rol,
                telefono
            } = req.body;

            // Campos obligatorios
            if (!correo || !contrasena || !confirmar_contrasena || !nombre_completo || !id_ubicacion || !rol) {
                return res.status(400).json({ 
                    error: 'Complete todos los campos obligatorios.' 
                });
            }

            // Validar formato de correo
            if (!validators.isValidEmail(correo)) {
                return res.status(400).json({ 
                    error: validators.getEmailErrorMessage() 
                });
            }

            // Validar formato de contraseña
            if (!validators.isValidPassword(contrasena)) {
                return res.status(400).json({ 
                    error: validators.getPasswordErrorMessage() 
                });
            }

            // Verificar que las contraseñas coincidan
            if (!validators.passwordsMatch(contrasena, confirmar_contrasena)) {
                return res.status(400).json({ 
                    error: 'Las contraseñas no coinciden.' 
                });
            }

            // Verificar si el correo ya existe
            const existingUser = await UserService.findByEmail(correo);
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'El correo ya está registrado. Inicie sesión o recupere su contraseña.',
                    actions: {
                        login: '/api/auth/login',
                        recuperar: '/api/auth/forgot-password'
                    }
                });
            }

            // Validar que el rol sea válido
            if (rol !== 'Cliente' && rol !== 'Prestador') {
                return res.status(400).json({ 
                    error: 'El rol debe ser "Cliente" o "Prestador".' 
                });
            }

            // Verificar que la ubicación exista
            const ubicacion = await Ubicacion.findByPk(id_ubicacion);
            if (!ubicacion) {
                return res.status(400).json({ 
                    error: 'Localidad no válida.' 
                });
            }

            const nuevoUsuario = await UserService.createUser({
                correo,
                contrasena,
                nombre_completo,
                id_ubicacion,
                rol,
                telefono
            });

            // Enviar email de bienvenida
            EmailService.sendWelcomeEmail(correo, nombre_completo)
                .catch(err => console.error('Error enviando email de bienvenida:', err));

            // Registrar evento
            console.log(`[REGISTRO] Usuario creado: ${nuevoUsuario.id_usuario} - ${correo} - Rol: ${rol}`);

            res.status(201).json({
                message: 'Usuario registrado correctamente. Ahora puede iniciar sesión.',
                usuario: {
                    id_usuario: nuevoUsuario.id_usuario,
                    correo: nuevoUsuario.correo,
                    nombre_completo,
                    rol: rol,
                    estado: 'activo'
                },
                redirect: '/api/auth/login'
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ 
                error: 'No fue posible completar el registro. Intente nuevamente más tarde.' 
            });
        }
    }
};