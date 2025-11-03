const controllers = require('../Controllers/RolController.js');
const express = require('express');
const router = express.Router();

router.get('/', controllers.getAllRoles);
router.get('/:id', controllers.getRoleById);
router.post('/create', controllers.createRole);
router.put('/update/:id', controllers.updateRole);
router.delete('/delete/:id', controllers.deleteRole);

module.exports = router;