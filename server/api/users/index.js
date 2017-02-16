const express = require('express');
const userController = require('./user.controller');
const router = express.Router();

router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/findAll', userController.findAllUser);
router.get('/findOne', userController.fineOneUser);
router.put('/update', userController.updateUser);
router.delete('/delete/:userId', userController.deleteUser);

module.exports = router;