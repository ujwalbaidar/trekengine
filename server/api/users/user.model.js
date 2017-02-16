const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	role: Number,
	email: {type: String, unique: true, required: true, dropDups: true},
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