const express = require('express');
const userController = require('./user.controller');
const router = express.Router();

router.post('/create', userController.createUser);
router.get('/findAll', userController.findAllUser);
router.get('/findOne:userId', userController.fineOneUser);
router.put('/update:userId', userController.updateUser);
router.delete('/delete:userId', userController.deleteUser);

module.exports = router;