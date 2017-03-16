const express = require('express');
const travelersController = require('./travellers.controller');
const router = express.Router();

router.get('/findAll', travelersController.getTravelerDetails);
// router.post('/create', travelersController.createTrips);
router.put('/update', travelersController.updateTrveler);
router.delete('/delete', travelersController.deleteTraveler);

module.exports = router;