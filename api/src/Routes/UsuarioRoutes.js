const controllers = require('../Controllers/UsuarioController.js');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');
const ValidationMiddleware = require('../Middlewares/validationMiddleware');
const express = require('express');
const router = express.Router();

router.get('/', verifyToken, requireRole('Administrador'), controllers.getAllUsers);
router.get('/:id', verifyToken, controllers.getUserById);
router.post('/create', verifyToken, requireRole('Administrador'), ValidationMiddleware.validateRequired(['correo', 'contrasena', 'id_rol']), controllers.createUser);
router.put('/update/:id', verifyToken, requireRole('Administrador'), ValidationMiddleware.validateRequired(['correo']), controllers.updateUser);

module.exports = router;
