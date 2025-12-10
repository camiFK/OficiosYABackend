const express = require('express');
const router = express.Router();

const RegisterController = require('../Controllers/RegisterController');
const LoginController = require('../Controllers/LoginController');
const PasswordRecoveryController = require('../Controllers/PasswordRecoveryController');
const AuthController = require('../Controllers/AuthController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

// Rutas de registro con validaciones
router.post('/register', 
    ValidationMiddleware.validateUserRegistration(),
    ValidationMiddleware.validatePasswordMatch('contrasena', 'confirmar_contrasena'),
    ErrorHandler.asyncHandler(RegisterController.register)
);

// Ruta de login con validaciones
router.post('/login',
    ValidationMiddleware.validateLogin(),
    ErrorHandler.asyncHandler(LoginController.login)
);

// Rutas de recuperación de contraseña
router.post('/forgot-password',
    ValidationMiddleware.validateRequired(['correo']),
    ValidationMiddleware.validateEmail('correo'),
    ErrorHandler.asyncHandler(PasswordRecoveryController.forgotPassword)
);

router.post('/reset-password',
    ValidationMiddleware.validateRequired(['token', 'nueva_contrasena']),
    ValidationMiddleware.validatePassword('nueva_contrasena'),
    ErrorHandler.asyncHandler(PasswordRecoveryController.resetPassword)
);

router.post('/validate-reset-token',
    ValidationMiddleware.validateRequired(['token']),
    ErrorHandler.asyncHandler(PasswordRecoveryController.validateResetToken)
);

// Rutas protegidas
router.get('/verify', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.verifyToken)
);

router.get('/me', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.getMe)
);

router.post('/logout', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.logout)
);

// Ruta para setup inicial de admin
router.post('/setup-admin', AuthController.setupAdmin);

module.exports = router;