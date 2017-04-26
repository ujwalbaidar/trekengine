const mongoose = require('mongoose');
let TripSchema = new mongoose.Schema({
	userId: String,
	name: {type: String, required: true},
	departureDate: Object,
	arrivalDate: Object,
	bookingId: String,
	status: { type: Boolean, default: true },
	createdDate: Date,
	updateDate: Date
});
mongoose.model('Trips', TripSchema);