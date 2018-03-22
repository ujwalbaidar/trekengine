const mongoose = require('mongoose');
let FeedbackMessageSchema = new mongoose.Schema({
	userId: {
		type:String,
		unique: true
	},
	message: String,
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	}
});
mongoose.model('Feedbackmessage', FeedbackMessageSchema);