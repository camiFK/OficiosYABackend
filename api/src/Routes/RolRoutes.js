const controllers = require('../Controllers/RolController.js');
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

router.get('/', verifyToken, requireRole('Administrador'), controllers.getAllRoles);
router.get('/:id', verifyToken, requireRole('Administrador'), controllers.getRoleById);
router.post('/create', verifyToken, requireRole('Administrador'), controllers.createRole);
router.put('/update/:id', verifyToken, requireRole('Administrador'), controllers.updateRole);
router.delete('/delete/:id', verifyToken, requireRole('Administrador'), controllers.deleteRole);

module.exports = router;