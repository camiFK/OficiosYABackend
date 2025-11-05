const validators = require('../Utils/validators');

// Middleware genérico para validación de datos de entrada

class ValidationMiddleware {
    
    //Valida campos obligatorios     
    static validateRequired(requiredFields) {
        return (req, res, next) => {
            const missingFields = [];
            const emptyFields = [];
            
            for (const field of requiredFields) {
                if (!(field in req.body)) {
                    missingFields.push(field);
                } else if (req.body[field] === null || req.body[field] === undefined || 
                          (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                    emptyFields.push(field);
                }
            }
            
            if (missingFields.length > 0 || emptyFields.length > 0) {
                return res.status(400).json({
                    error: 'Datos de entrada inválidos',
                    missingFields,
                    emptyFields,
                    message: 'Complete todos los campos obligatorios'
                });
            }
            
            next();
        };
    }
    
    // Valida formato de email
    static validateEmail(emailField = 'correo') {
        return (req, res, next) => {
            const email = req.body[emailField];
            
            if (email && !validators.isValidEmail(email)) {
                return res.status(400).json({
                    error: 'Formato de correo inválido',
                    field: emailField,
                    message: validators.getEmailErrorMessage()
                });
            }
            
            next();
        };
    }
    
    // Valida formato de contraseña

    static validatePassword(passwordField = 'contrasena') {
        return (req, res, next) => {
            const password = req.body[passwordField];
            
            if (password && !validators.isValidPassword(password)) {
                return res.status(400).json({
                    error: 'Formato de contraseña inválido',
                    field: passwordField,
                    message: validators.getPasswordErrorMessage()
                });
            }
            
            next();
        };
    }
    
    // Valida longitud de strings
    static validateStringLength(fieldRules) {
        return (req, res, next) => {
            const errors = [];
            
            for (const [field, rules] of Object.entries(fieldRules)) {
                const value = req.body[field];
                
                if (value && typeof value === 'string') {
                    const length = value.trim().length;
                    
                    if (rules.min && length < rules.min) {
                        errors.push({
                            field,
                            message: `${field} debe tener al menos ${rules.min} caracteres`
                        });
                    }
                    
                    if (rules.max && length > rules.max) {
                        errors.push({
                            field,
                            message: `${field} no puede exceder ${rules.max} caracteres`
                        });
                    }
                }
            }
            
            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Longitud de campos inválida',
                    validationErrors: errors
                });
            }
            
            next();
        };
    }
    
    // Sanitiza datos de entrada
    static sanitizeInput(fields) {
        return (req, res, next) => {
            for (const field of fields) {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    // Remover espacios extra y caracteres básicos
                    req.body[field] = req.body[field]
                        .trim()
                        .replace(/\s+/g, ' ')
                        .replace(/[<>]/g, '');
                }
            }
            next();
        };
    }
    
    // Valida que las contraseñas coincidan
    static validatePasswordMatch(passwordField = 'contrasena', confirmField = 'confirmar_contrasena') {
        return (req, res, next) => {
            const password = req.body[passwordField];
            const confirmPassword = req.body[confirmField];
            
            if (password && confirmPassword && !validators.passwordsMatch(password, confirmPassword)) {
                return res.status(400).json({
                    error: 'Las contraseñas no coinciden',
                    fields: [passwordField, confirmField]
                });
            }
            
            next();
        };
    }
    
    // Valida formato de teléfono
    static validatePhone(phoneField = 'telefono') {
        return (req, res, next) => {
            const phone = req.body[phoneField];
            
            if (phone && !validators.isValidPhone(phone)) {
                return res.status(400).json({
                    error: 'Formato de teléfono inválido',
                    field: phoneField,
                    message: 'El teléfono debe tener entre 10 y 20 dígitos'
                });
            }
            
            next();
        };
    }
    
    // Valida ID de rol
    static validateRole(roleField = 'id_rol') {
        return (req, res, next) => {
            const role = req.body[roleField];
            
            if (role !== undefined && ![2, 3].includes(parseInt(role))) {
                return res.status(400).json({
                    error: 'ID de rol inválido',
                    field: roleField,
                    message: 'El rol debe ser Cliente (2) o Prestador (3)'
                });
            }
            
            next();
        };
    }

    // Middleware combinado para registro de usuario
    static validateUserRegistration() {
        return [
            this.validateRequired(['correo', 'contrasena', 'nombre_completo']),
            this.sanitizeInput(['correo', 'nombre_completo']),
            this.validateEmail('correo'),
            this.validatePassword('contrasena'),
            this.validateRole('id_rol'),
            this.validateStringLength({
                'nombre_completo': { min: 2, max: 100 }
            })
        ];
    }

    // Middleware combinado para login
    static validateLogin() {
        return [
            this.validateRequired(['correo', 'contrasena']),
            this.sanitizeInput(['correo']),
            this.validateEmail('correo')
        ];
    }
}

module.exports = ValidationMiddleware;