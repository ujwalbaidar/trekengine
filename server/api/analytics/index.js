const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');

router.get('/audience/overview', analyticsController.getAudienceOverview);
router.get('/audience/age', analyticsController.getAudienceByAge);
router.get('/audience/gender', analyticsController.getAudienceByGender);
router.get('/audience/country', analyticsController.getAudienceByCountry);
router.get('/audience/age-details', analyticsController.getAudienceDetailsByAge);
router.get('/audience/country-details', analyticsController.getAudienceDetailsByCountry);

router.get('/trek/overview', analyticsController.getTrekOverview);
router.get('/trek/booikings', analyticsController.getTrekBookingAnalytics);
router.get('/trek/bookings-details', analyticsController.getBookingAnalysisDetails);

module.exports = router;