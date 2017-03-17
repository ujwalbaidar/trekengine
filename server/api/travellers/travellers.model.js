const mongoose = require('mongoose');
let TravelerSchema = new mongoose.Schema({
	userId: String,
	firstName: String,
	middleName: String,
	lastName: String,
	nationality: String,
	dob: String,
	permanentAddress: String,
	telephone: String,
	email: String,
	attachments: {
		passport: String,
		insurance: String,
		profile: String
	},
	emergencyContact: {
		name: String,
		number: String,
		relation: String
	},
	airportPickup: {
		confirmation: { type:Boolean, default: false },
		date: String,
		time: String
	},
	hotel: {
		confirmation: { type:Boolean, default: false },
		name: String,
		address: String,
		telephone: String
	},
	messageBox: String,
	status: { type:Boolean, default: true },
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