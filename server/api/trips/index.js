const express = require('express');
const tripController = require('./trips.controller');
const router = express.Router();

router.get('/findAll', tripController.getAllTrips);
router.post('/create', tripController.createTrips);
router.put('/update', tripController.updateTrips);
router.delete('/delete/:userId', tripController.deleteTrips);

module.exports = router;
