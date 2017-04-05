const mongoose = require('mongoose');
let FeaturesSchema = new mongoose.Schema({
	userId: String,
	name: String,
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