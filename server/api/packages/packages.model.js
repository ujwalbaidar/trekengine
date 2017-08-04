const mongoose = require('mongoose');
let PackagesSchema = new mongoose.Schema({
	userId: String,
	name: {
		type: String,
		required: true
	},
	description: String,
	cost: {
		type: Number,
		required: true
	},
	days: {
		type: Number,
		required: true
	},
	trialPeriod: {
		type: Number,
		required: true
	},
	priorityLevel: {
		type: Number,
		required: true
	},
	featureIds: Array,
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
mongoose.model('Packages', PackagesSchema);