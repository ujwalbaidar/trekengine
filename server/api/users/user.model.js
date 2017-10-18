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
	facebookAuths: Object,
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
		type:String
	},
	birthday: {
		type:Object
	},
	gender: {
		type:String
	},
	organizationName: {
		type:String
	},
	organizationContact: String,
	organizationEmail: String,
	organizationStreet: String,
	organizationCity: String,
	organizationCountry: String,
	dailyTripNotification: { type: Boolean, default: true },
	weeklyTripNotification: { type: Boolean, default: true },
	processCompletion: { type: Boolean, default: false },
	lastLoggedIn: { type: Date },
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