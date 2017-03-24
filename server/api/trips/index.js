const express = require('express');
const tripController = require('./trips.controller');
const router = express.Router();

router.get('/findAll', tripController.getAllTrips);
router.get('/findOne', tripController.getTrip);
router.post('/create', tripController.createTrips);
router.put('/update', tripController.updateTrips);
router.delete('/delete', tripController.deleteTrips);

module.exports = router;
