const mongoose = require('mongoose');
let PackageBillingSchema = new mongoose.Schema({
	userId: String,
	packageType: String,
	packageCost: Number,
	activatesOn: Number,
	expiresOn: Number,
	remainingDays: Number,
	usesDays: Number,
	trialPeriod: Number,
	priorityLevel: Number,
	features: Array,
	freeUser: { type:Boolean, default: true },
	onHold: { type:Boolean, default: false },
	status: { type:Boolean, default: true },
	packagePayment: { type:Boolean, default: true },
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	},
	paymentMethod: String,
	paymentInfo: Object
});
mongoose.model('PackageBillings', PackageBillingSchema);