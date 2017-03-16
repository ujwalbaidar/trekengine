const mongoose = require('mongoose');
let TravelerSchema = new mongoose.Schema({
	userId: String,
	firstName: String,
	lastName: String,
	nationality: String,
	dob: String,
	permanentAddress: String,
	telephone: String,
	email: String,
	hotel: Object,
	attachments: {
		passport: String,
		insurance: String,
		photo: String
	},
	emergencyContact: {
		name: String,
		phone: String,
		relation: String
	},
	airportReceive: {
		date: Object,
		time: String,
		flightNumber: String
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
mongoose.model('Travelers', TravelerSchema);