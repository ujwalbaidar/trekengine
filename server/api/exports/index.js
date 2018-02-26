const express = require('express');
const exportsController = require('./exports.controller');
const router = express.Router();

router.get('/exportBookings', exportsController.exportBookings);

module.exports = router;