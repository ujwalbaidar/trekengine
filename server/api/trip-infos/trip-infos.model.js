const mongoose = require('mongoose');
let TripInfosSchema = new mongoose.Schema({
	userId: String,
	name: {type: String, required: true},
	status: { type: Boolean, default: true },
	createdDate: Date,
	updateDate: Date
});
mongoose.model('TripInfos', TripInfosSchema);