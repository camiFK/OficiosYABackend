const controllers = require('../Controllers/UsuarioController.js');
const express = require('express');
const router = express.Router();

router.get('/', controllers.getAllUsers);
router.get('/:id', controllers.getUserById);
router.post('/create', controllers.createUser);
router.put('/update/:id', controllers.updateUser);
router.delete('/delete/:id', controllers.deleteUser);

module.exports = router;
