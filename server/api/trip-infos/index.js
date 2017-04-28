const express = require('express');
const tripInfoCtrl = require('./trip-infos.controller');
const router = express.Router();

router.get('/findUserTripsData', tripInfoCtrl.findUserTripsData);

module.exports = router;