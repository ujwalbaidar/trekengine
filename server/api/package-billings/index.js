const express = require('express');
const packageBillingsController = require('./package-billings.controller');
const router = express.Router();


router.post('/submit', packageBillingsController.submitUserPackage);


module.exports = router;