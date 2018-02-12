const mongoose = require('mongoose');
let TravelerSchema = new mongoose.Schema({
	userId: String,
	firstName: {
		type:String,
		required: true
	},
	middleName: String,
	lastName: {
		type:String,
		required: true
	},
	nationality: {
		type:String,
		required: true
	},
	dob: {
		type:Object,
		required: true
	},
	age: Number,
	permanentAddress: String,
	telephone: String,
	email: {
		type:String,
		required: true
	},
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
		date: Object,
		hrTime: String,
		minTime: String
	},
	hotel: {
		confirmation: { type:Boolean, default: false },
		name: String,
		address: String,
		telephone: String
	},
	messageBox: String,
	selected: { type:Boolean, default: false },
	status: { type:Boolean, default: true },
	bookingId: String,
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	},
	googleCalendarObj: Object,
	gender: {
		type:String,
		required: true
	}
	/*tripGuideCount: Number,
	tripGuideDays: Number,
	tripGuidePerDayCost: Number,
	tripPoerterNumber: Number,
	tripPoerterDays: Number,
	tripPoerterPerDayCost: Number,
	tripTransportationCost: Number,
	tripTransportationRemarks: String,
	tripAccomodationCost: Number,
	tripFoodCost: Number,
	tripPickupCost: Number,
	tripPermitCost: Number,
	tripFlightCost: Number,
	tripHotelCost: Number,
	tripHotelRemark: String,
	travelerTripCost: Number,
	tripRemark: String*/
});
mongoose.model('Travelers', TravelerSchema);