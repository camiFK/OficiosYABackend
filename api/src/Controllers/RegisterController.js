const UserService = require('../Services/UserService');
const EmailService = require('../Services/EmailService');
const TokenService = require('../Services/TokenService');
const ResponseService = require('../Services/ResponseService');
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
                id_rol,
                telefono
            } = req.body;

            // Validación de campos obligatorios básicos
            if (!correo || !contrasena || !confirmar_contrasena || !nombre_completo || !id_ubicacion || !id_rol) {
                const missingFields = {};
                if (!correo) missingFields.correo = 'Requerido';
                if (!contrasena) missingFields.contrasena = 'Requerido';
                if (!confirmar_contrasena) missingFields.confirmar_contrasena = 'Requerido';
                if (!nombre_completo) missingFields.nombre_completo = 'Requerido';
                if (!id_ubicacion) missingFields.id_ubicacion = 'Requerido';
                if (!id_rol) missingFields.id_rol = 'Requerido';
                
                return ResponseService.validationError(res, missingFields, 'Complete todos los campos obligatorios');
            }

            // Validar que el id_rol sea válido
            if (![2, 3].includes(parseInt(id_rol))) {
                return res.status(400).json({ 
                    error: 'El rol debe ser Cliente (2) o Prestador (3)' 
                });
            }

            // Validación específica para prestadores
            if (parseInt(id_rol) === 3 && !telefono) {
                return res.status(400).json({ 
                    error: 'Para prestadores es obligatorio proporcionar el teléfono' 
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

            // Obtener el nombre del rol para uso interno
            const rol = parseInt(id_rol) === 2 ? 'Cliente' : 'Prestador';

            // Verificar que la ubicación exista
            const ubicacion = await Ubicacion.findByPk(id_ubicacion);
            if (!ubicacion) {
                return res.status(400).json({ 
                    error: 'Localidad no válida.' 
                });
            }

            // Obtener campos adicionales para prestador
            const { descripcion, experiencia, categorias } = req.body;

            const nuevoUsuario = await UserService.createUser({
                correo,
                contrasena,
                nombre_completo,
                id_ubicacion,
                id_rol: parseInt(id_rol),
                rol, // Nombre del rol para uso interno
                telefono,
                descripcion: parseInt(id_rol) === 3 ? descripcion : null,
                experiencia: parseInt(id_rol) === 3 ? experiencia : null,
                categorias: parseInt(id_rol) === 3 ? categorias : null
            });

            // Generar token JWT para auto-login
            const token = TokenService.generateAuthToken({
                id_usuario: nuevoUsuario.id_usuario,
                correo: nuevoUsuario.correo,
                id_rol: parseInt(id_rol),
                rol: rol
            });

            // Enviar email de bienvenida
            EmailService.sendWelcomeEmail(correo, nombre_completo)
                .catch(err => console.error('Error enviando email de bienvenida:', err));

            res.status(201).json({
                message: `${rol} registrado correctamente. Ya puede usar su cuenta.`,
                usuario: {
                    id_usuario: nuevoUsuario.id_usuario,
                    correo: nuevoUsuario.correo,
                    nombre_completo,
                    rol: rol,
                    estado: 'activo'
                },
                token: token,
                redirect: rol === 'Prestador' ? '/panel/prestador' : '/panel/solicitante'
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ 
                error: 'No fue posible completar el registro. Intente nuevamente más tarde.' 
            });
        }
    }
};