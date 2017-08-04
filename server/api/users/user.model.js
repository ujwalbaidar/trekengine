const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
	firstName: {
		type:String,
		required: true
	},
	middleName: String,
	lastName: {
		type:String,
		required: true
	},
	role: Number,
	email: {type: String, unique: true, required: true, dropDups: true},
	password: String,
	domain: {
		protocol: String,
		website: String,
		siteUrl: String
	},
	googleAuths: Object,
	package: {
		packageId: String,
		expireDate: String,
	},
	calendarNotification: {
		hrTime: { type: String, default: '01' },
		minTime: { type: String, default: '00' }
	},
	status: { type:Boolean, default: false },
	mobile: String,
	telephone: String,
	street: String,
	city: String,
	country: {
		type:String,
		required: true
	},
	birthday: {
		type:Object,
		required: true
	},
	gender: {
		type:String,
		required: true
	},
	organizationName: {
		type:String,
		required: true
	},
	organizationContact: String,
	organizationEmail: String,
	organizationStreet: String,
	organizationCity: String,
	organizationCountry: String,
	dailyTripNotification: { type: Boolean, default: true },
	weeklyTripNotification: { type: Boolean, default: true },
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	},
	guides:[],
	admins: []
});
mongoose.model('User', UserSchema);