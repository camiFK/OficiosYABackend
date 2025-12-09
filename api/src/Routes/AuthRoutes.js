const express = require('express');
const router = express.Router();

const RegisterController = require('../Controllers/RegisterController');
const LoginController = require('../Controllers/LoginController');
const PasswordRecoveryController = require('../Controllers/PasswordRecoveryController');
const AuthController = require('../Controllers/AuthController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const ErrorHandler = require('../Middlewares/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestión de autenticación y sesiones
 */

// Rutas de registro con validaciones
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', 
    ValidationMiddleware.validateUserRegistration(),
    ValidationMiddleware.validatePasswordMatch('contrasena', 'confirmar_contrasena'),
    ErrorHandler.asyncHandler(RegisterController.register)
);

// Ruta de login con validaciones
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login',
    ValidationMiddleware.validateLogin(),
    ErrorHandler.asyncHandler(LoginController.login)
);

// Rutas de recuperación de contraseña
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicita recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/forgot-password',
    ValidationMiddleware.validateRequired(['correo']),
    ValidationMiddleware.validateEmail('correo'),
    ErrorHandler.asyncHandler(PasswordRecoveryController.forgotPassword)
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reestablece la contraseña usando un token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Token inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password',
    ValidationMiddleware.validateRequired(['token', 'nueva_contrasena']),
    ValidationMiddleware.validatePassword('nueva_contrasena'),
    ErrorHandler.asyncHandler(PasswordRecoveryController.resetPassword)
);

/**
 * @swagger
 * /api/auth/validate-reset-token:
 *   post:
 *     summary: Valida el token de recuperación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateResetTokenRequest'
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/validate-reset-token',
    ValidationMiddleware.validateRequired(['token']),
    ErrorHandler.asyncHandler(PasswordRecoveryController.validateResetToken)
);

// Rutas protegidas
/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verifica un token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token faltante o inválido
 */
router.get('/verify', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.verifyToken)
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtiene el usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: Token faltante o inválido
 */
router.get('/me', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.getMe)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cierra la sesión actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Sesión cerrada
 *       401:
 *         description: Token faltante o inválido
 */
router.post('/logout', 
    verifyToken, 
    ErrorHandler.asyncHandler(AuthController.logout)
);

// Ruta para setup inicial de admin
/**
 * @swagger
 * /api/auth/setup-admin:
 *   post:
 *     summary: Crea el usuario administrador inicial
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Admin creado o ya existente
 *       400:
 *         description: Error durante la creación
 */
router.post('/setup-admin', AuthController.setupAdmin);

module.exports = router;