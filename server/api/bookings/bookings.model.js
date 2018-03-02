const mongoose = require('mongoose');
const shortId = require('shortid');
let BookingSchema = new mongoose.Schema({
	userId: String,
	userEmail: String,
	bookingId: {
    	type: String,
    	'default': shortId.generate,
    	unique: true
	},
	groupName: String,
	tripName: String,
	travellerCount: { type: Number, default:0 },
	totalCost: { type:Number, default:0 },
	tripCost: { type:Number, default:0 },
	advancePaid: { type:Number, default:0 },
	dueAmount: { type:Number, default:0 },
	selectedGuide: String,
	status: { type: Boolean, default: true },
	travellers: [],
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	},
	tripGuideCount: Number,
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
	tripRemark: String
});
mongoose.model('Bookings', BookingSchema);