const express = require('express');
const travelersController = require('./travellers.controller');
const router = express.Router();

router.get('/findAll', travelersController.getTravelerDetails);
router.get('/query', travelersController.queryTravelerDetails);
// router.post('/create', travelersController.createTrips);
router.put('/update', travelersController.updateTraveler);
router.delete('/delete', travelersController.deleteTraveler);

module.exports = router;