const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../configs/config')[env];
const async = require('async');
const readline = require('readline');
const crypto = require('crypto');
const Packages = mongoose.model('Packages');
const PackageBillings = mongoose.model('PackageBillings');
const Notifications = mongoose.model('Notifications');
const AppEmail = require('../../library/appEmail/appEmail');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const randomstring = require("randomstring");
const fs = require('fs');
const ejs = require('ejs');
const htmlToText = require('html-to-text');
/**
* Create User on register
* set billing Object and update
* mail user about registration and selected package trial periods
**/

exports.createUser = function(req, res){
	req.body.firstName = req.body.fname;
	req.body.lastName = req.body.lname;
	req.body.role = req.body.role?req.body.role:20;
	req.body.createdDate = new Date();
	req.body.updatedDate = new Date();
	req.body.password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
                   .update(req.body.password)
                   .digest('hex');
    if(req.body.domain){
    	req.body.domain = req.body.domain;
    }
	saveUser(req.body)
		.then(userData=>{
			let mailOptions = {};
			mailOptions = {
				from: config.appEmail.senderAddress,
			    to: userData.email, 
			    subject: 'Trek Engine: Registration Success',
			};

			let jwtSignData = {
				email: req.body.email,
				packageType: req.body.selectedPackage.name,
				packageCost: req.body.selectedPackage.cost,
				trialPeriod: req.body.selectedPackage.trialPeriod,
				priorityLevel: req.body.selectedPackage.priorityLevel,
				features: JSON.stringify(req.body.selectedPackage.featureIds)
			};


			let jwtSignOptions = {
				expiresIn: config.activateAccount.expireTime, 
				algorithm: config.activateAccount.algorithm 
			};

			let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);

			let templateString = fs.readFileSync('server/templates/userRegistraion.ejs', 'utf-8');
			mailOptions.html = ejs.render(templateString, { userName:req.body.fname, webHost: config.webHost+'/authorization/token/'+token+'/validate-user' });
			mailOptions.text = htmlToText.fromString(mailOptions.html, {
    			wordwrap: 130
			});
			sendEmail(mailOptions)
				.then(mailInfo=>{
					res.status(200).json({success:true, data:{user:userData}});
				})
				.catch(mailErr=>{
					console.log(mailErr)
					res.status(400).json({success:false, data:mailErr});
				});
		})
		.catch(userErr=>{
			res.status(400).json({success:false, data:userErr});
		});
}

function saveUser(userObj){
	return new Promise((resolve, reject)=>{
		let user = new User(userObj);
		user.save((err, user)=>{
			if(err){
				reject(err);
			}else{
				resolve(user);
			}
		});
	})
}

exports.findAllUser = function(req, res){
	let searchField = {};
	User.find(searchField,(err, users)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:users});
		}
	});
}

exports.fineOneUser = function(req, res){
	User.findOne(req.query, {_id:0}, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:user});
		}
	});
}

exports.fineUserByQuery = function(req, res){
	User.find(req.query, { password:0 }, (err, users)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:users});
		}
	});
}

exports.updateUser = function(req, res){
	let updateQuery = req.query;
	let updateData = req.body;
	User.update(req.query, updateData, {upsert: true}, (err, userUpdate)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:userUpdate});
		}
	});
}

exports.deleteUser = function(req, res){
	User.remove(req.params.userId, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:user});
		}
	});
}

exports.loginUser = function(req, res){
	User.findOne({email:req.body.email, status: true}, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			if(user){
				let loginPassword = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
						.update(req.body.password)
						.digest('hex');
				if(user.password == loginPassword){
					if (user.role==20) {
						PackageBillings.findOne({userId:user._id, status: true, onHold: false}, (billingErr, billingResponse)=>{
							if (billingErr) {
								res.status(400).json({success:false, message:"Failed to verify billingSetup!", data:{errorCode:'emailErr'}});
							}else{
								if(billingResponse){
									let token = jwt.sign(
											{
												email:user.email, 
												userId: user._id, 
												role: user.role, 
												remainingDays: billingResponse.remainingDays, 
												packageType: billingResponse.priorityLevel
											}, 
											config.loginAuth.secretKey, 
											{
												expiresIn: config.loginAuth.expireTime, 
												algorithm: config.loginAuth.algorithm 
											}
										);
									res.status(200).json({
										success:true, 
										message: "Authorised Successfully",
										data: {
											token: token, 
											index: user.role, 
											remainingDays: billingResponse.remainingDays, 
											packageType: billingResponse.priorityLevel
										}});
								}else{
									let token = jwt.sign(
											{email:user.email, userId: user._id, role: user.role}, 
											config.loginAuth.secretKey, 
											{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
										);
									res.status(200).json({success:true, message: "Authorised Successfully", data: {token: token, index: user.role}});
								}
							}
						});
					}else{
						let token = jwt.sign(
								{email:user.email, userId: user._id, role: user.role}, 
								config.loginAuth.secretKey, 
								{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
							);
						res.status(200).json({success:true, message: "Authorised Successfully", data: {token: token, index: user.role}});
					}
				}else{
					res.status(400).json({success:false, message: "Password doesn't match!", data: {errorCode:'passwordErr'}});
				}
			}else{
				res.status(400).json({success:false, message:"Email doesn't exist!", data:{errorCode:'emailErr'}});
			}
		}
	});
}


exports.seedUser = function(req, res){
	User.findOne({role:10},(err, user)=>{
			if(err){
				res.status(400).send(err);
			}else{
				if(user){
					res.status(400).send("Super Admin already exists");
				}else{
					var info = {};

					async.series([
					    (callback) => {
					    	rl.question('Email Address: ', function(args){
					    		info.email = args;
					    		callback();
					    	})
					    },
					    (callback) => {
					    	rl.question('Password: ', function(args){
					    		info.password = args;
					    		callback();
					    	})
					    }
					],
					function(err, results) {
						let superAdminPassword = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
								.update(info.password)
								.digest('hex');
						rl.close();
						option = {
							firstName: 'Super',
							lastName: 'Admin',
							email: info.email,
							password: superAdminPassword,
							role: 10,
							status: true,
							createdDate: new Date(),
							updatedDate: new Date()
						};
						let user = new User(option);
						user.save((err, user)=>{
							if(err){
								res.status(400).json({success:false, data:err});
							}else{
								console.log('Super Admin Seed Successfully!!');
								res.status(200).json({success:true, data:user});
							}
						});
					});
				}
			}
		});
}

exports.updateVendors = function(req, res){
	User.findOne({email:req.body.from}, {_id:0}, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			if(user && user.role && user.role<=20){
				User.update({email:req.body.from},{ $addToSet: { guides: req.body.email }}, function(adminUserErr, adminUser){
					if(adminUserErr){
						res.status(400).json({success:false, data: adminUserErr})
					}else{
						User.update({email:req.body.email},{ $addToSet: { admins: req.body.from }}, function(guideUserErr, guideUser){
							if(guideUserErr){
								res.status(400).json({success:false, data: guideUserErr});
							}else{
								res.status(200).send({data:{success:true, message: 'Successfully assigned!'}});
							}
						});
					}
				});
			}else{
				res.status(200).json({data:{success:false, message:'Request sender has no right to add guide!'}});
			}
		}
	});
}


exports.addGuideToAdmin = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role == 20){
		let currentDateTime = new Date();
		let expireDateTime = currentDateTime.getTime()+24*3600*1000;

		queryUser({email:req.body.email})
			.then(userInfo=>{
				if(userInfo && userInfo.length>0){
					let saveObj = {
						sentTo: userInfo[0].email,
						sentBy: req.headers.email,
						subject: 'add-as-guide',
						notificationType: 'request'
					}
					createNotifications(saveObj)
						.then((notificationData)=>{
							mailOptions = {
								from: config.appEmail.senderAddress,
							    to: userInfo[0].email, 
							    subject: 'Request to assign as Guide',
							    text: `You have been requested to accept role of guide for ${req.headers.email}. Please Login to ${config.webHost}, to accept the request, using your credentials: Email: ${userInfo[0].email} `,
							    html: `<p>You have been requested to accept role of guide for ${req.headers.email}.</p>
							    	<p> Please Login to ${config.webHost}, to accept the request, using your credentials: </p>
							    	<p>Email: ${userInfo[0].email} </p>`,
							};
							sendEmail(mailOptions)
								.then(mailInfo=>{
									res.status(200).send({success: true, data: {mailInfo: mailInfo, type: 'notified'} });
								})
								.catch(mailErr=>{
									res.status(400).json({success:false, data: mailErr});
								});
						})
						.catch(notificationError=>{
							res.status(400).json({success:false, data: notificationError});
						});
				}else{
					let guideInfo = {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						role: 30,
						admins: [],
						status: true
					};


					createGuide(guideInfo, req.headers.userId, true)
						.then(guideDetails=>{
							let saveObj = {
								sentTo: guideDetails.email,
								sentBy: req.headers.email,
								subject: 'add-as-guide',
								notificationType: 'request'
							};
							createNotifications(saveObj)
								.then((notificationData)=>{
									mailOptions = {
										from: config.appEmail.senderAddress,
									    to: guideDetails.email, 
									    subject: 'Request to assign as Guide',
									    text: `You have been requested to join as guide by ${req.headers.email}. Please Login to ${config.webHost}, using following credentials: Email: ${guideDetails.email} Password: ${guideDetails.password} Note: Please update your profile to secure your details`,
									    html: `<p>You have been requested to join as guide by ${req.headers.email}.</p>
									    	<p> Please Login to ${config.webHost}, using following credentials: </p>
									    	<p>Email: ${guideDetails.email} </p>
									    	<p>Password: ${guideDetails.password}</p>
									    	<p>Note: Please update your profile to secure your details</p>`
									};
									sendEmail(mailOptions)
										.then(mailInfo=>{
											res.status(200).send({success: true, data: {mailInfo: mailInfo, type: 'notified'} });
										})
										.catch(mailErr=>{
											res.status(400).json({success:false, data: mailErr});
										});
								})
								.catch(notificationError=>{
									res.status(400).json({success:false, data: notificationError});
								});
						})
						.catch(guideErr=>{
							res.status(400).json({success:false, data: guideErr});
						});
				}
			})
			.catch(userInfoErr=>{
				res.status(400).json({success:false, data: userInfoErr});
			});
	}
}

exports.guideListByAdmin = function(req, res){
	if(req.headers.userId){
		User.findOne({_id:req.headers.userId}, {guides:1,_id:0,email:1}, function(err, user){
			if(err){
				res.status(400).json({success:false, data: err, message:"Failed to fetch User!"});
			}else{
				if(user.guides.length>0){
					User.find( { email: { $in: user.guides } } , {_id:0, password:0} ,function(queryErr, userGuides){
						if(err){
							res.status(400).json({success:false, data: queryErr, message:"Failed to fetch guides listing!"});
						}else{
							res.status(200).json({success:true, data:{guides:userGuides, approver:user.email}});
						}
					});
				}else{
					res.status(200).json({success:true, data:[], message: "Guides are not assigned!"});
				}
			}
		})
		
	}
}

exports.removeGuide = function(req, res){
	User.update( { _id: req.headers.userId}, { $pull: { guides: req.headers.guide }}, function(err, user){
		if(err){
			res.status(400).json({success:false, data:err, message:'Failed to remove Guide!'});
		}else{
			User.update({email:req.headers.guide}, {$pull:{admins: req.headers.approver}}, function(guideErr, guideUser){
				if(guideErr){
					res.status(400).json({success:false, data:guideErr, message:'Failed to remove Guide!'});
				}else{
					res.status(200).json({success:true, data: guideUser, message: 'Removed Guide Successfully!'});
				}
			});
		}
	});
}

function saveUserPackageBilling(user, package, freeUser){
	return new Promise((resolve, reject)=>{
		let currentDateTime = new Date();
		currentDateTime.setHours(0,0,0,0);
		let activateDate = Math.floor(currentDateTime/1000);
		let expireDate = activateDate+30*24*3600;

		var saveObj = {
			userId: user.userId,
			packageType: package.name,
			packageCost: package.cost,
			activatesOn: activateDate,
			expiresOn: expireDate,
			remainingDays: package.days,
			features: package.featureIds,
			usesDays: 0,
			freeUser: freeUser,
			onHold: false,
			status: true
		}
		let mailOptions = {};
		mailOptions = {
			from: config.appEmail.senderAddress,
		    to: user.email, 
		    subject: 'Trek Engine: Registration Success',
		    text: `You have been registered successfully in Trek Engine with ${package.days} days ${package.name} Package.`,
		    html: `<p>You have been registered successfully in Trek Engine with ${package.days} days ${package.name} Package.</p>` 
		};
		saveUserPackage(saveObj)
			.then(savePackageResponse=>{
				sendEmail(mailOptions).
				then(mailInfo=>{
					resolve(savePackageResponse);
				})
				.catch(err=>{
					reject(err);
				});
			})
			.catch(err=>{
				reject(err);
			});
	});
}

function saveUserPackage(saveData){
	return new Promise((resolve, reject)=>{
		let packageBillings = new PackageBillings(saveData);
		packageBillings.save((err, savePackage)=>{
			if(err){
				reject(err);
			}else{
				resolve(savePackage);
			}
		});
	})
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

function queryUser(query){
	return new Promise((resolve, reject)=>{
		User.find(query, {password:0}, (err, user)=>{
			if(err){
				reject(err);
			}else{
				resolve(user);
			}
		});
	});
}

function createGuide(params, assignee, generatePassword){
	return new Promise((resolve, reject)=>{
		if(generatePassword == true){
			var randomPassword = randomstring.generate(7);
			params.password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
                   .update(randomPassword)
                   .digest('hex');
		}
		let user = new User(params);
		user.save((err, user)=>{
			if(err){
				reject(err);
			}else{
				user.password = randomPassword;
				resolve(user);
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

exports.getUserProfile = function(req, res){
	if(req.headers && req.headers.userId){
		User.findOne({_id:req.headers.userId}, (err, user)=>{
			if(err){
				res.status(400).json({success: false, data: err, message:"Failed to fetch user info!"});
			}else{
				res.status(200).json({success: true, data: user});
			}
		});
	}
}

exports.updateUserProfile = function(req, res){
	if(req.headers && req.headers.userId){
		let updateObj = {
			firstName: req.body.firstName,
			middleName: req.body.middleName,
			lastName: req.body.lastName,
			updateDate: new Date(),
			mobile: req.body.mobile,
			telephone: req.body.telephone,
			street: req.body.street,
			city: req.body.city,
			country: req.body.country,
			birthday: req.body.birthday,
			gender: req.body.gender,
			domain: req.body.domain,
			organizationName: req.body.organizationName,
			organizationContact: req.body.organizationContact,
			organizationEmail: req.body.organizationEmail,
			organizationStreet: req.body.organizationStreet,
			organizationCity: req.body.organizationCity,
			organizationCountry: req.body.organizationCountry,
			dailyTripNotification: req.body.dailyTripNotification,
			weeklyTripNotification: req.body.weeklyTripNotification
		};

		User.update({_id:req.headers.userId}, updateObj, (err, updateData)=>{
			if(err){
				res.status(400).json({success: false, data: err, message:"Failed to update user info!"});
			}else{
				res.status(200).json({success: true, data: updateData});
			}
		});
	}
}

exports.updateUserPassword = function(req, res){
	if(req.headers && req.headers.userId){
		let password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
                   .update(req.body.userPassword)
                   .digest('hex');
		User.update({_id:req.headers.userId}, {password: password}, (err, updateData)=>{
			if(err){
				res.status(400).json({success: false, data: err, message:"Failed to update user password!"});
			}else{
				res.status(200).json({success: true, data: updateData});
			}
		});
	}
}

exports.activateUser = function(req, res){
	jwt.verify(req.headers.registrationtoken, config.activateAccount.secretKey, { algorithms: config.activateAccount.algorithm }, function(err, decoded) {
			if(err){
				if(err.name == 'TokenExpiredError'){
					let decodedRegistrationToken = jwt.decode(req.headers.registrationtoken);

					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: decodedRegistrationToken.email, 
					    subject: 'Trek Engine: Registration Success',
					};

					let jwtSignData = {
							email: decodedRegistrationToken.email,
							packageType: decodedRegistrationToken.packageType,
							packageCost: decodedRegistrationToken.packageCost,
							trialPeriod: decodedRegistrationToken.trialPeriod,
							priorityLevel: decodedRegistrationToken.priorityLevel,
							features: decodedRegistrationToken.features
						};

					let jwtSignOptions = {
						expiresIn: config.activateAccount.expireTime, 
						algorithm: config.activateAccount.algorithm 
					}
					let token = jwt.sign( jwtSignData, config.activateAccount.secretKey, jwtSignOptions);

					let templateString = fs.readFileSync('server/templates/userRegistrationRefreshToken.ejs', 'utf-8');
					mailOptions.html = ejs.render(templateString, { userName:req.body.fname, webHost: config.webHost+'/authorization/token/'+token+'/validate-user' });
					mailOptions.text = htmlToText.fromString(mailOptions.html, {
					    wordwrap: 130
					});
					sendEmail(mailOptions)
						.then(mailInfo=>{
							res.status(200).json({success: false, data: 'expire-err'})
						})
						.catch(mailErr=>{
							res.status(400).json({success:false, data:mailErr});
						});
				}else{
					res.status(400).send({success:false, data: err, message: 'Invalid Token!'});
				}
			}else{
				User.findOne({email: decoded.email},(err, userData)=>{
					if(err){
						res.status(400).send({success:false, data: err});
					}else{
						if(userData.status == false){
							User.update({email: decoded.email, status: false}, {status: true}, (err, updateData)=>{
								if(err){
									res.status(400).send({success:false, data: err, message: 'Failed to activate account'});
								}else{
									let currentDateTime = new Date();
										currentDateTime.setHours(0,0,0,0);
										let activateDate = Math.floor(currentDateTime/1000);
										var	expireDate=0;
										if(decoded.packageCost>0){
											expireDate = activateDate+decoded.trialPeriod*24*3600;
										}else{
											expireDate = activateDate+1*24*3600;
										}
										let packageObj = {
											userId: userData._id,
											packageType: decoded.packageType,
											packageCost: decoded.packageCost,
											trialPeriod: decoded.trialPeriod,
											priorityLevel: decoded.priorityLevel,
											activatesOn: activateDate,
											expiresOn: expireDate,
											remainingDays: (decoded.packageCost>0)?decoded.trialPeriod:1,
											features: JSON.parse(decoded.features),
											usesDays: 0,
											freeUser: true,
											onHold: false,
											status: true,
											packagePayment: true
										};
										
										saveUserPackage(packageObj)
											.then(billingData=>{
												res.status(200).json({success: false, data: 'already-active'});
											})
											.catch(billingErr=>{
												res.status(400).json({success:false, data:billingErr});
											});
								}
							});
						}else{
							res.status(200).json({success: false, data: 'already-active'});
						}
					}
				})
			}
		});
}

exports.forgotPasswordEmail = function(req, res){
	queryUser(req.body)
		.then(user => {
			if(user.length>0){
				if(user[0].status == true){

					let jwtSignData = {
						email: req.body.email
					};

					let jwtSignOptions = {
						expiresIn: '1h', 
						algorithm: config.activateAccount.algorithm 
					};

					let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);
			
					let templateString = fs.readFileSync('server/templates/forgottenPasswordRequest.ejs', 'utf-8');
					mailOptions = {
						from: config.appEmail.senderAddress,
					    to: req.body.email, 
					    subject: 'Trek Engine: Forgotten Password Request',
					};
					mailOptions.html = ejs.render(templateString, { userEmail:req.body.email, webHost: config.webHost+'/forgot-password/token/'+token+'/reset-password' });
					mailOptions.text = htmlToText.fromString(mailOptions.html, {
					    wordwrap: 130
					});
					sendEmail(mailOptions)
						.then(mailInfo=>{
							res.status(200).json({success:true, data:mailInfo});
						})
						.catch(mailErr=>{
							res.status(400).json({success:false, data:mailErr});
						});

				}else{
					res.status(200).json({success: false, data: 'inactive-account'});
				}
			}else{
				res.status(200).json({success: false, data: 'wrong-email'});
			}
		})
		.catch(userQueryErr=>{
			res.status(400).json({success:false, data:userQueryErr});
		})
}

exports.resetUserPassword = function(req, res){
	if(req.headers.resettoken){
		jwt.verify(req.headers.resettoken, config.activateAccount.secretKey, { algorithms: config.activateAccount.algorithm }, (err, decoded) =>{
			if(err){
				if(err.name == 'TokenExpiredError'){
					let decodedToken = jwt.decode(req.headers.resettoken);
					let jwtSignData = {
						email: decodedToken.email
					};

					let jwtSignOptions = {
						expiresIn: '1h', 
						algorithm: config.activateAccount.algorithm 
					};

					let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);
			
					let templateString = fs.readFileSync('server/templates/forgottenPasswordRequest.ejs', 'utf-8');
					mailOptions = {
						from: config.appEmail.senderAddress,
					    to: decodedToken.email, 
					    subject: 'Trek Engine: Forgotten Password Request',
					};
					mailOptions.html = ejs.render(templateString, { userEmail:req.body.email, webHost: config.webHost+'/forgot-password/token/'+token+'/reset-password' });
					mailOptions.text = htmlToText.fromString(mailOptions.html, {
					    wordwrap: 130
					});
					sendEmail(mailOptions)
						.then(mailInfo=>{
							res.status(200).send({success:false, data: 'token-expired'});
						})
						.catch(mailErr=>{
							res.status(400).json({success:false, data:mailErr});
						});
				}else{
					res.status(400).send({success:false, data: err, message: 'Invalid Token!'});
				}
			}else{
				let userPassword = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
                   .update(req.body.userPassword)
                   .digest('hex');

				User.update({email:decoded.email}, {password: userPassword}, (userUpdateErr, updateData)=>{
					if(userUpdateErr){
						res.status(400).json({success: false, data: userUpdateErr});
					}else{
						res.status(200).send({success:true, data: updateData});
					}
				});
			}
		});
	}else{
		res.status(400).json({success: false, data: 'empty-token'});
	}
}