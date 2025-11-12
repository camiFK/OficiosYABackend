const controllers = require('../Controllers/UsuarioController.js');
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');
const express = require('express');
const router = express.Router();

router.get('/', verifyToken, requireRole('Administrador'), controllers.getAllUsers);
router.get('/:id', controllers.getUserById);
router.post('/create', controllers.createUser);
router.put('/update/:id', controllers.updateUser);

module.exports = router;
