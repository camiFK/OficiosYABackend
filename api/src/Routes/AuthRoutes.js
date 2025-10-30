const express = require('express');
const router = express.Router();

const RegisterController = require('../Controllers/RegisterController');
const LoginController = require('../Controllers/LoginController');
const PasswordRecoveryController = require('../Controllers/PasswordRecoveryController');
const AuthController = require('../Controllers/AuthController');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

router.post('/register', RegisterController.register);
router.post('/login', LoginController.login);
router.post('/forgot-password', PasswordRecoveryController.forgotPassword);
router.post('/reset-password', PasswordRecoveryController.resetPassword);
router.post('/validate-reset-token', PasswordRecoveryController.validateResetToken);
router.get('/me', verifyToken, AuthController.getMe);
router.post('/logout', verifyToken, AuthController.logout);

module.exports = router;