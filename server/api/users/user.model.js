const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
	firstName: String,
	middleName: String,
	lastName: String,
	role: Number,
	email: {type: String, unique: true, required: true, dropDups: true},
	password: String,
	domain: {
		protocol: String,
		website: String
	},
	loginAccess:[{
		method: String,
		accessToken: String,
		refreshToken: String,
		expireTime: Number,
	}],
	package: {
		packageId: String,
		expireDate: String,
	},
	status: { type:Boolean, default: false },
	mobile: String,
	telephone: String,
	street: String,
	city: String,
	country: String,
	birthday: Object,
	gender: String,
	organizationName: String,
	organizationContact: String,
	organizationEmail: String,
	organizationStreet: String,
	organizationCity: String,
	organizationCountry: String,
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