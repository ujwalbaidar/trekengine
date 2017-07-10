const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');

router.get('/trek/overview', analyticsController.getTrekOverview);
router.get('/trek/booikings', analyticsController.getTrekBookingAnalytics);
router.get('/trek/bookings-details', analyticsController.getBookingAnalysisDetails);

module.exports = router;