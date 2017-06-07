const mongoose = require('mongoose');
const Notifications = mongoose.model('Notifications');
const User = mongoose.model('User');

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const AppEmail = require('../../library/appEmail/appEmail');
const fs = require('fs');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

exports.getAllNotifications = function(req, res){
	if(req.headers && req.headers.userId && req.headers.email){
		Notifications.find({sentTo:req.headers.email}, (err, notifications)=>{
				if(err){
					res.status(400).json({success:false, data:err});
				}else{
					res.status(200).json({success:true, data:notifications});
				}
			});
	}
}

exports.submitResponse = function(req, res){
	if(req.headers && req.headers.userId){
		updateNotification({_id: req.body.notification._id}, {viewed: true})
			.then(updateResp=>{
				let saveObj = {
						sentTo: req.body.notification.sentBy,
						sentBy: req.body.notification.sentTo,
						notificationType: 'reply'
					};
				if(req.body.acceptance === true){
					updateGuideAcceptance(req.body.notification)
						.then(updateUser=>{
							saveObj.subject = 'guide-request-accepted';
							createNotifications(saveObj)
								.then(notificationResponse=>{
										submitAcceptanceEmail(req.body)
											.then(mailResponse=>{
												res.status(200).json({success:true, data:notificationResponse});
											})
											.catch(mailErr=>{
												res.status(400).json({ success:true, data: mailErr });
											});
								})
								.catch(notificationErr=>{
									res.status(400).json({success:false, data: notificationErr, message: 'Failed to create notification'});
								})
						})
						.catch(updateUerErr=>{
							res.status(400).json({success:false, data:updateErr, message: 'Failed To update user.'});
						});
				}else{
					saveObj.subject = 'guide-request-rejected';
					createNotifications(saveObj)
						.then(notificationResponse=>{
								submitAcceptanceEmail(req.body)
									.then(mailResponse=>{
										res.status(200).json({success:true, data: notificationResponse});
									})
									.catch(mailErr=>{
										res.status(400).json({ success:true, data: mailErr });
									});
						})
						.catch(notificationErr=>{
							res.status(400).json({success:false, data: notificationErr, message: 'Failed to create notification'});
						})
				}
			})
			.catch(updateErr=>{
				res.status(400).json({success:false, data:updateErr, message: 'Failed To update notification.'});
			});
	}
}

function updateNotification(query, updateObj){
	return new Promise((resolve, reject)=>{
		Notifications.update(query, updateObj, (err, updateResponse)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateResponse);
			}
		});
	});
}

function updateGuideAcceptance(notificationInfo){
	return new Promise((resolve, reject)=>{
		var adminEmail = notificationInfo.sentBy;
		var guideEmail = notificationInfo.sentTo;
		User.update(
			{ email: adminEmail },
			{ $addToSet: { guides: guideEmail }},
			(errUpdateAdmin, updateAdmin)=>{
				if(errUpdateAdmin){
					reject(errUpdateAdmin);
				}else{
					User.update(
						{ email: guideEmail },
						{ $addToSet: { admins: adminEmail }},
						(errUpdateGuide, updateGuide)=>{
							if(errUpdateGuide){
								reject(errUpdateGuide);
							}else{
								resolve(true);
							}
						});
				}
			});
	});
}

function createNotifications(notificationData){
	return new Promise((resolve, reject)=>{
		let notification  = new Notifications(notificationData);
		notification.save((err, notificationInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(notificationInfo);
			}
		});
	});
}

function submitAcceptanceEmail(reqObject){
	return new Promise((resolve, reject)=>{
		let mailOptions = {
			from: config.appEmail.senderAddress,
		    to: reqObject.notification.sentBy, 
		    subject: 'Response to join as guide',
		};
		let templateString = fs.readFileSync('server/templates/responseToJoinAsGuide.ejs', 'utf-8');
		mailOptions.html = ejs.render(templateString, { acceptance: (reqObject.acceptance==true?'accepted':'declined'), guideEmail: reqObject.notification.sentTo });
		mailOptions.text = htmlToText.fromString(mailOptions.html, {
			wordwrap: 130
		});
		
		sendEmail(mailOptions)
			.then(mailInfo=>{
				resolve(mailInfo);
			})
			.catch(err=>{
				reject(err);
			});
	});
}

function sendEmail(mailOptions){
	return new Promise((resolve, reject)=>{
		config.appEmail.mailOptions = mailOptions;
		let appEmail = new AppEmail(config.appEmail);
		appEmail.sendEmail()
			.then(emailInfo=>{
				resolve(emailInfo);
			})
			.catch(emailError=>{
				reject(emailError);
			});
	});
}