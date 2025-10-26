const controllers = require('../Controllers/RolController.js');
const express = require('express');
const router = express.Router();

router.get('/', controllers.getAllRols);
router.get('/:id', controllers.getRolById);
router.post('/create', controllers.createRol);
router.put('/update/:id', controllers.updateRol);
router.delete('/delete/:id', controllers.deleteRol);

module.exports = router;