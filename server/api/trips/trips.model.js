const mongoose = require('mongoose');
let TripSchema = new mongoose.Schema({
	name: {type: String, unique: true, required: true, dropDups: true},
	departureDate: Number,
	arrivalDate: Number,
	guideId: String
});
mongoose.model('Trips', TripSchema);