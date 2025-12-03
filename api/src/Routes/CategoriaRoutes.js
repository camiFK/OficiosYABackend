const controllers = require('../Controllers/CategoriaController.js');
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../Middlewares/authMiddleware');

router.get('/', controllers.getAllCategorias);
router.get('/:id', verifyToken, controllers.getCategoriaById);
router.post('/create', verifyToken, requireRole('Administrador'), controllers.createCategoria);
router.put('/update/:id', verifyToken, requireRole('Administrador'), controllers.updateCategoria);
router.delete('/delete/:id', verifyToken, requireRole('Administrador'), controllers.deleteCategoria);

module.exports = router;