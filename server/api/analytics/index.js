const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');

router.get('/trek/overview', analyticsController.getTrekOverview);

module.exports = router;