const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
	username: String,
	firstName: String,
	middleName: String,
	lastName: String,
	role: Number,
	email: String,
	password: String,
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
	createdDate: Date,
	updatedDate: Date
});
mongoose.model('User', UserSchema);