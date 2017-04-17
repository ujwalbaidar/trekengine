const mongoose = require('mongoose');
let PackagesSchema = new mongoose.Schema({
	userId: String,
	name: String,
	description: String,
	cost: Number,
	days: Number,
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