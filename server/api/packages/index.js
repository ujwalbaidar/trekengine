const express = require('express');
const packagesController = require('./packages.controller');
const router = express.Router();


router.post('/submit', packagesController.submitUserPackage);


module.exports = router;