const express = require('express');
const checkoutsController = require('./checkouts.controller');
const router = express.Router();

router.post('/processCheckoutPayment', checkoutsController.processCheckoutPayment);

module.exports = router;