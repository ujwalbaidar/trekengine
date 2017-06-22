const mongoose = require('mongoose');
let FlightSchema = new mongoose.Schema({
	userId: String,
	bookingId: String,
	flightType: { type:Boolean, default: false },
	departure: {
		date: Object,
		cost: Number,
		name: String,
		hrTime: String,
		minTime: String
	},
	arrival: {
		date: Object,
		cost: Number,
		name: String,
		hrTime: String,
		minTime: String
	},
	flightDepartureCalendarId: String,
	flightArrivalCalendarId: String,
	status: { type: Boolean, default: true },
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	}
});
mongoose.model('Flights', FlightSchema);