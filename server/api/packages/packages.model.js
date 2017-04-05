const mongoose = require('mongoose');
let PackageSchema = new mongoose.Schema({
	userId: String,
	packageType: String,
	packageCost: Number,
	activatesOn: Number,
	expiresOn: Number,
	remainingDays: Number,
	usesDays: Number,
	freeUser: { type:Boolean, default: true },
	onHold: { type:Boolean, default: false },
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
mongoose.model('Packages', PackageSchema);