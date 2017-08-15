const express = require('express');
const userController = require('./user.controller');
const router = express.Router();

router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/updateVendors', userController.updateVendors);
router.get('/findAll', userController.findAllUser);
router.get('/findOne', userController.fineOneUser);
router.get('/findByQuery', userController.fineUserByQuery);
router.put('/update', userController.updateUser);
router.delete('/delete/:userId', userController.deleteUser);
router.get('/seedUser', userController.seedUser);
router.get('/listByAdmin', userController.guideListByAdmin);
router.delete('/remove', userController.removeGuide);
router.post('/addGuideToAdmin', userController.addGuideToAdmin);
router.get('/getProfile', userController.getUserProfile);
router.put('/updateProfile', userController.updateUserProfile);
router.put('/updatePassword', userController.updateUserPassword);
router.post('/forgotPasswordEmail', userController.forgotPasswordEmail);
router.put('/resetUserPassword', userController.resetUserPassword);
router.get('/getOauthUrl', userController.getOauthUrl);
router.post('/saveOauthUser', userController.saveOauthUser);
router.post('/validateCode', userController.validateCode);
router.put('/completeRegistrationProcess', userController.completeRegistrationProcess);
router.post('/sendActivationLink', userController.sendActivationLink);
router.get('/getCountryList', userController.getCountryList);

module.exports = router;