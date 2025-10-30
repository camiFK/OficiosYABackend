// Validaciones comunes reutilizables
module.exports = {
    // Valida formato de correo electrónico
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Valida política de contraseña: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(password);
    },

    // Mensaje de error para contraseña inválida
    getPasswordErrorMessage() {
        return 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial.';
    },

    // Mensaje de error para email inválido
    getEmailErrorMessage() {
        return 'Ingrese un correo válido. Ejemplo: usuario@dominio.com';
    },

    // Valida que las contraseñas coincidan
    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }
};