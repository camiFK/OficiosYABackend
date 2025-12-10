const UserService = require('../Services/UserService');
const EmailService = require('../Services/EmailService');
const TokenService = require('../Services/TokenService');
const ResponseService = require('../Services/ResponseService');
const validators = require('../Utils/validators');
const { Ubicacion } = require('../Models/Index');


module.exports = {
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

            // Validaciones…
            if (!correo || !contrasena || !confirmar_contrasena || !nombre_completo || !id_ubicacion || !id_rol) {
                return ResponseService.validationError(res, {}, "Faltan campos obligatorios.");
            }

            if (!validators.isValidEmail(correo)) {
                return ResponseService.validationError(res, {}, "Correo inválido.");
            }

            if (!validators.passwordsMatch(contrasena, confirmar_contrasena)) {
                return ResponseService.validationError(res, {}, "Las contraseñas no coinciden.");
            }

            const userExists = await UserService.findByEmail(correo);
            if (userExists) {
                return ResponseService.error(res, "El correo ya está registrado.");
            }

            const rolNombre = parseInt(id_rol) === 2 ? "Cliente" : "Prestador";

            // Crear usuario (cliente o prestador)
            const nuevoUsuario = await UserService.createUser({
                correo,
                contrasena,
                nombre_completo,
                id_ubicacion,
                id_rol,
                rol: rolNombre,
                telefono,
                descripcion: req.body.descripcion || null,
                experiencia: req.body.experiencia || null,
                categorias: req.body.categorias || null
            });

            
            // Volvemos a obtener el usuario PARA ARMAR EL userData COMPLETO
            const usuarioCompleto = await UserService.findByEmail(correo);

            // Esto arma el objeto COMPLETO tal como lo obtiene el login
            const { userData, redirectUrl } = await UserService.getUserDataForLogin(usuarioCompleto);

            // Agregar id_rol al token
            userData.id_rol = usuarioCompleto.id_rol;

            // Crear token FINAL EXACTO AL LOGIN
            const token = TokenService.generateAuthToken(userData);

            // Enviar email de bienvenida (opcional)
            EmailService.sendWelcomeEmail(correo, nombre_completo)
                .catch(err => console.error("Error enviando email:", err));

            return res.status(201).json({
                message: `${rolNombre} registrado correctamente.`,
                usuario: userData,   
                token: token,        
                redirect: redirectUrl
            });

        } catch (error) {
            console.error("Error en registro:", error);
            return ResponseService.error(res, "Error interno en el registro.");
        }
    }
};