const controllers = require('../Controllers/CategoriaController.js');
const express = require('express');
const router = express.Router();

router.get('/', controllers.getAllCategorias);
router.get('/:id', controllers.getCategoriaById);
router.post('/create', controllers.createCategoria);
router.put('/update/:id', controllers.updateCategoria);
router.delete('/delete/:id', controllers.deleteCategoria);

module.exports = router;