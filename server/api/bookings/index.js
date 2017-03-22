const express = require('express');
const bookingController = require('./bookings.controller');
const router = express.Router();

router.get('/findAll', bookingController.getAllBooking);
router.get('/findOne', bookingController.getBooking);
router.post('/create', bookingController.createBooking);
router.put('/update', bookingController.updateBooking);
router.delete('/delete', bookingController.deleteBooking);

module.exports = router;