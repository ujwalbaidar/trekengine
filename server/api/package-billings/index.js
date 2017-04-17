const express = require('express');
const packageBillingsController = require('./package-billings.controller');
const router = express.Router();


router.get('/get', packageBillingsController.getUserPackage);
router.post('/submit', packageBillingsController.submitUserPackage);
router.put('/update', packageBillingsController.updateUserPackage);
router.get('/getAll', packageBillingsController.getUsersBillings);
router.get('/queryUserBilling', packageBillingsController.queryUserBilling);
router.put('/updateUserBilling', packageBillingsController.updateUserBilling);

module.exports = router;