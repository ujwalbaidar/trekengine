const mongoose = require('mongoose');
let TripSchema = new mongoose.Schema({
	userId: String,
	name: {type: String, unique: true, required: true, dropDups: true},
	departureDate: Object,
	arrivalDate: Object,
	guideId: String,
	status: { type: Boolean, default: true },
	createdDate: Date,
	updateDate: Date
});
mongoose.model('Trips', TripSchema);