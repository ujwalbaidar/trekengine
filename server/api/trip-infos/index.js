const express = require('express');
const tripInfoCtrl = require('./trip-infos.controller');
const router = express.Router();

router.get('/findUserTripsData', tripInfoCtrl.findUserTripsData);
router.post('/createUserTripsData', tripInfoCtrl.createTripInfos);
router.put('/updateUserTripsData', tripInfoCtrl.updateTripInfos);
router.delete('/deleteUserTrekInfos', tripInfoCtrl.deleteTripInfos);

module.exports = router;