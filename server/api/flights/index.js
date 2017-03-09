const express = require('express');
const flightsController = require('./flights.controller');
const router = express.Router();

router.get('/findAll', flightsController.getAllFlights);
router.post('/create', flightsController.createFlights);
router.put('/update', flightsController.updateFlights);
router.delete('/delete', flightsController.deleteFlights);

module.exports = router;
