const mongoose = require('mongoose');
let NotificationSchema = new mongoose.Schema({
	sentTo: String,
	sentBy: String,
	subject: String,
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
mongoose.model('Notifications', NotificationSchema);