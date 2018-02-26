const express = require('express');
const exportsController = require('./exports.controller');
const router = express.Router();

router.get('/exportBookings', exportsController.exportBookings);
router.get('/exportTravelers', exportsController.exportTravelers);

module.exports = router;