const mongoose = require('mongoose');
const Feedbackmessage = mongoose.model('Feedbackmessage');

const getAdminFeedback = (req, res)=>{
	let userId = req.headers.userId;
	Feedbackmessage.find({userId: userId}, (err, feedbackMessage) => {
		if(err){
			res.status(400).json({status: false, data: err, message: "Failed to retrieve feedback message!"});
		}else{
			res.status(200).json({status: true, data: feedbackMessage, message: "Feedback message retrieved successfully!"});
		}
	});
}

const saveFeedbackMessage = (req, res)=>{
	let userId = req.headers.userId;
	req.body.userId = userId;
	let feedbackmessage = new Feedbackmessage(req.body);

	feedbackmessage.save((err, message)=>{
		if(err){
			if(err.code === 11000){
				res.status(200).json({status: false, data: err, message: "You have already saved feedback message!"});
			}else{
				res.status(400).json({status: false, data: err, message: "Failed to save feedback message!"});
			}
		}else{
			res.status(200).json({status: true, data: message, message: "Feedback message saved successfully!"});
		}
	});
}

const updateFeedbackMessage = (req, res)=>{
	let userId = req.headers.userId;
	let messageId = req.body._id;
	let message = req.body.message;

	Feedbackmessage.update({
		userId: userId, _id: messageId
	}, { 
		message: message,
		updateDate: new Date()
	}, (err, updateResp)=>{
		if(err){
			res.status(400).json({status: false, data: err, message: "Failed to update feedback message!"});
		}else{
			res.status(200).json({status: true, data: updateResp, message: "Feedback Message updated successfully!"});
		}
	});
}

module.exports = {
	getAdminFeedback,
	saveFeedbackMessage,
	updateFeedbackMessage
}
