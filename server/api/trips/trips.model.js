const mongoose = require('mongoose');
let TripSchema = new mongoose.Schema({
	userId: String,
	userEmail: String,
	departureDate: Object,
	arrivalDate: Object,
	bookingId: String,
	departureTime: {
		hrTime: String,
		minTime: String
	},
	arrivalTime: {
		hrTime: String,
		minTime: String
	},
	departureCalendarObj: Object,
	arrivalCalendarObj: Object,
	status: { type: Boolean, default: true },
	createdDate: { type: Date, default: new Date()},
	updateDate: { type: Date, default: new Date()}
});
mongoose.model('Trips', TripSchema);