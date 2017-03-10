const mongoose = require('mongoose');
let FlightSchema = new mongoose.Schema({
	userId: String,
	bookingId: String,
	flightType: { type:Boolean, default: false },
	departure: {
		dateTime: Object,
		cost: Number,
		name: String
	},
	arrival: {
		dateTime: Object,
		cost: Number,
		name: String
	},
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