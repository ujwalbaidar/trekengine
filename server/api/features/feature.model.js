const mongoose = require('mongoose');
let FeaturesSchema = new mongoose.Schema({
	userId: String,
	name: {
		type: String,
		required: true,
		max: [60, 'Name Field exceeds the maximum allowed length (60).']
	},
	description: String,
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
mongoose.model('Features', FeaturesSchema);