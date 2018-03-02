const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');

router.post('/audience/overview', analyticsController.getAudienceOverview);
router.post('/audience/age', analyticsController.getAudienceByAge);
router.post('/audience/gender', analyticsController.getAudienceByGender);
router.post('/audience/country', analyticsController.getAudienceByCountry);
router.post('/audience/age-details', analyticsController.getAudienceDetailsByAge);
router.post('/audience/country-details', analyticsController.getAudienceDetailsByCountry);

router.post('/trek/overview', analyticsController.getTrekOverview);
router.post('/trek/bookings', analyticsController.getTrekBookingAnalytics);
router.post('/trek/bookings-details', analyticsController.getBookingAnalysisDetails);
router.get('/trek/monthly-bookings', analyticsController.getMonthlyBookings);

module.exports = router;