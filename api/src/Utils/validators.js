// Validaciones comunes reutilizables
module.exports = {
    // Valida formato de correo electrónico
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email.trim());
    },

    // Valida política de contraseña: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(password);
    },

    // Valida formato de teléfono
    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
        return phoneRegex.test(phone.trim());
    },

    // Valida que una cadena solo contenga letras y espacios
    isValidName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/;
        return nameRegex.test(name.trim());
    },

    // Valida longitud de cadena
    isValidLength(str, min = 0, max = Infinity) {
        if (typeof str !== 'string') return false;
        
        const length = str.trim().length;
        return length >= min && length <= max;
    },

    // Valida que un valor sea un número entero positivo
    isValidPositiveInteger(value) {
        return Number.isInteger(value) && value > 0;
    },

    // Valida formato de URL
    isValidURL(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Valida estado de solicitud
    isValidSolicitudEstado(estado) {
        const validEstados = ['Iniciada', 'En Proceso', 'Finalizada', 'Cancelada'];
        return validEstados.includes(estado);
    },

    // Valida estado de usuario
    isValidUsuarioEstado(estado) {
        const validEstados = ['activo', 'inactivo', 'bloqueado'];
        return validEstados.includes(estado);
    },

    // Valida rango de calificación (1-5 estrellas)
    isValidRating(rating) {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    },

    // Sanitiza string eliminando caracteres peligrosos
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        return str
            .trim()
            .replace(/[<>]/g, '') // Eliminar < >
            .replace(/\s+/g, ' '); // Múltiples espacios a uno
    },

    // Sanitiza email
    sanitizeEmail(email) {
        if (typeof email !== 'string') return email;
        
        return email.toLowerCase().trim();
    },

    // Mensaje de error para contraseña inválida
    getPasswordErrorMessage() {
        return 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial.';
    },

    // Mensaje de error para email inválido
    getEmailErrorMessage() {
        return 'Ingrese un correo válido. Ejemplo: usuario@dominio.com';
    },

    // Mensaje de error para teléfono inválido
    getPhoneErrorMessage() {
        return 'Ingrese un teléfono válido con 10 a 20 dígitos. Ejemplo: +54 9 11 1234-5678';
    },

    // Mensaje de error para nombre inválido
    getNameErrorMessage() {
        return 'El nombre debe contener solo letras y espacios, entre 2 y 100 caracteres.';
    },

    // Valida que las contraseñas coincidan
    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    },

    // Validación combinada para datos de usuario
    validateUserData(userData) {
        const errors = [];
        
        if (!this.isValidEmail(userData.correo)) {
            errors.push({ field: 'correo', message: this.getEmailErrorMessage() });
        }
        
        if (!this.isValidPassword(userData.contrasena)) {
            errors.push({ field: 'contrasena', message: this.getPasswordErrorMessage() });
        }
        
        if (!this.isValidName(userData.nombre_completo)) {
            errors.push({ field: 'nombre_completo', message: this.getNameErrorMessage() });
        }
        
        if (userData.telefono && !this.isValidPhone(userData.telefono)) {
            errors.push({ field: 'telefono', message: this.getPhoneErrorMessage() });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Validación para solicitud de servicio
    validateSolicitudData(solicitudData) {
        const errors = [];
        
        if (!this.isValidLength(solicitudData.titulo, 5, 100)) {
            errors.push({ field: 'titulo', message: 'El título debe tener entre 5 y 100 caracteres' });
        }
        
        if (!this.isValidLength(solicitudData.descripcion, 10, 1000)) {
            errors.push({ field: 'descripcion', message: 'La descripción debe tener entre 10 y 1000 caracteres' });
        }
        
        if (solicitudData.estado && !this.isValidSolicitudEstado(solicitudData.estado)) {
            errors.push({ field: 'estado', message: 'Estado de solicitud inválido' });
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};