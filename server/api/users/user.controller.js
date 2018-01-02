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
let OAuthLib = require('../../library/oAuth/oAuth');
const request = require('request');
const Bookings = mongoose.model('Bookings');
const Flights = mongoose.model('Flights');
const Travelers = mongoose.model('Travelers');
const TripInfos = mongoose.model('TripInfos');
const Trips = mongoose.model('Trips');

/**
* Create User on register
* Process Completion false
* Status False
**/

exports.createUser = function(req, res){
	queryUser({email: req.body.email})
	.then(userInfo=>{
		if(userInfo.length>0){
			let userData = userInfo[0];
			if(userData.processCompletion !== undefined && userData.processCompletion==false){
				res.status(200).json({data: {success: false, errorCode: 2, userData: userData, msg: 'Organization Info Incomplete!'}});
			}else{
				if(userData.status !== undefined && userData.status==false){
					res.status(200).json({data: {success: false, errorCode: 4, userData: userData, msg: 'Account is Inactive!'}});
				}else{
					var errorCode = 5;
					res.status(200).json({data: {success: false, errorCode: 5, userData: userData, msg: 'All setup!'}});
				}
			}
		}else{
			req.body.firstName = req.body.fname;
			req.body.lastName = req.body.lname;
			req.body.role = req.body.role?req.body.role:20;
			req.body.createdDate = new Date();
			req.body.updatedDate = new Date();
			req.body.password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
								.update(req.body.password)
								.digest('hex');
			saveUser(req.body)
				.then(userData=>{
					res.status(200).json({success:true, data: {userData:userData}});
				})
				.catch(userErr=>{
					res.status(400).json({success:false, data:userErr});
				});
		}
	})
	.catch(userInfoErr=>{
		res.status(400).json({success:false, data: userInfoErr});
	});
}

exports.completeRegistrationProcess = function(req, res){
	let updateObj = {
		organizationName: req.body.organizationName,
		timezone: req.body.timezone,
		processCompletion: true,
		updatedDate: new Date(),
		lastLoggedIn: new Date()
	}
	if(req.body.domain){
    	updateObj.domain = req.body.domain;
    	updateObj.siteUrl = req.body.protocol+req.body.website;
    }

    User.update({email:req.body.email}, updateObj, (userUpdateErr, updateUser)=>{
		if(userUpdateErr){
			res.status(400).json({success:false, data: userUpdateErr});
		}else{
			generateActivationLink(req.body.email)
				.then(emailInfo=>{
					res.status(200).json({data:{success: true, user:emailInfo}});
				})
				.catch(linkErr=>{
					res.status(400).json({success:false, data:linkErr});
				});
		}
	});
}

exports.sendActivationLink = function(req, res){
	generateActivationLink(req.body.email)
		.then(emailInfo=>{
				res.status(200).json({data:{success: true, user:emailInfo}});
			})
			.catch(linkErr=>{
				res.status(400).json({success:false, data:linkErr});
			});
}

function generateActivationLink(userEmail){
	return new Promise((resolve, reject)=>{
		queryUser({email: userEmail})
			.then(userInfo=>{
				let mailOptions = {};
				mailOptions = {
					from: config.appEmail.senderAddress,
				    to: userEmail, 
				    subject: 'Activate Your Trek Engine Account',
				};
				let jwtSignData = {
					userName: userInfo[0].firstName,
					email: userEmail,
					freeUser: true
				};

				let jwtSignOptions = {
					expiresIn: config.activateAccount.expireTime, 
					algorithm: config.activateAccount.algorithm 
				};

				let token = jwt.sign(jwtSignData, config.activateAccount.secretKey, jwtSignOptions);
				let templateString = fs.readFileSync('server/templates/userRegistraion.ejs', 'utf-8');
				mailOptions.html = ejs.render(
					templateString, { 
						userName: userInfo[0].firstName, 
						userEmail: userEmail,
						appLink: config.webHost,
						webHost: config.webHost+'/authorization/token/'+token+'/validate-user' 
					});
				mailOptions.text = htmlToText.fromString(mailOptions.html, {
	    			wordwrap: 130
				});
				sendEmail(mailOptions)
					.then(mailInfo=>{
						resolve(mailInfo);
					})
					.catch(mailErr=>{
						reject(mailErr);
					});
			})
			.catch(userInfoErr=>{
				reject(userInfoErr);
			});
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

exports.activateUser = function(req, res){
	jwt.verify(req.headers.registrationtoken, config.activateAccount.secretKey, { algorithms: config.activateAccount.algorithm }, function(err, decoded) {
			if(err){
				if(err.name == 'TokenExpiredError'){
					let decodedRegistrationToken = jwt.decode(req.headers.registrationtoken);

					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: decodedRegistrationToken.email, 
					    subject: 'Activate Your Trek Engine Account',
					};

					let jwtSignData = {
							userName: decodedRegistrationToken.userName,
							email: decodedRegistrationToken.email,
							freeUser: true							
						};

					let jwtSignOptions = {
						expiresIn: config.activateAccount.expireTime, 
						algorithm: config.activateAccount.algorithm 
					}
					let token = jwt.sign( jwtSignData, config.activateAccount.secretKey, jwtSignOptions);

					let templateString = fs.readFileSync('server/templates/userRegistraion.ejs', 'utf-8');

					mailOptions.html = ejs.render(
						templateString, { 
							userName: decodedRegistrationToken.userName, 
							userEmail: decodedRegistrationToken.email,
							appLink: config.webHost,
							webHost: config.webHost+'/authorization/token/'+token+'/validate-user' 
						}
					);
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
							Packages.find({"status" : true}).sort({priorityLevel:-1}).limit(1).exec((packageErr, packages)=>{
								if(packageErr){
									res.status(400).send({success:false, data: packageErr, message: 'Failed to retrieve package'});
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
										packageType: packages[0].name,
										packageCost: packages[0].cost,
										trialPeriod: packages[0].trialPeriod,
										priorityLevel: packages[0].priorityLevel,
										activatesOn: activateDate,
										expiresOn: expireDate,
										remainingDays: (decoded.packageCost>0)?decoded.trialPeriod:1,
										features: packages[0].featureIds,
										usesDays: 0,
										freeUser: true,
										onHold: false,
										status: true,
										packagePayment: true
									};

									User.update({email: decoded.email, status: false}, {status: true}, (err, updateData)=>{
										if(err){
											res.status(400).send({success:false, data: err, message: 'Failed to activate account'});
										}else{
											saveUserPackage(packageObj)
												.then(billingData=>{
													res.status(200).json({success: false, data: 'active'});
												})
												.catch(billingErr=>{
													res.status(400).json({success:false, data:billingErr});
												});
										}
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
	User.findOne({email:req.body.email}, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			if(user){
				let loginPassword = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
						.update(req.body.password)
						.digest('hex');
				if(user.password == loginPassword){
					if (user.role==20) {
						if(user.processCompletion == true){
							if(user.status == true){
								let updateObj = {
									lastLoggedIn: new Date(), 
									$inc: {loginCount: 1}
								};

								User.update({email:req.body.email}, updateObj, (userUpdateErr, userUpdate)=>{
									if(userUpdateErr){
										res.status(400).json({data: {success: false, errorCode: 4, userData: {email:req.body.email}, msg: 'Failed to update login Record!'}});
									}else{
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
															success: true,
															token: token, 
															index: user.role, 
															remainingDays: billingResponse.remainingDays, 
															packageType: billingResponse.priorityLevel,
															email: req.body.email,
															userName: user.firstName
														}});
												}else{
													let token = jwt.sign(
															{email:user.email, userId: user._id, role: user.role}, 
															config.loginAuth.secretKey, 
															{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
														);
													let data = {success:true, userName: user.firstName, token: token, index: user.role, email: user.email};											
													res.status(200).json({success:true, message: "Authorised Successfully", data: data});
												}
											}
										});
									}
								})
							}else{
								res.status(200).json({data: {success: false, errorCode: 6, userData: {email:req.body.email}, msg: 'Account is Inactive!'}});
							}
						}else{
							res.status(200).json({data: {success: false, errorCode: 4, userData: {email: req.body.email}, message: 'Organization Info Incomplete!'}});
						}
					}else{
						let token = jwt.sign(
								{email:user.email, userId: user._id, role: user.role}, 
								config.loginAuth.secretKey, 
								{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
							);
						res.status(200).json({success:true, message: "Authorised Successfully", data: {success: true, token: token, index: user.role, email: user.email}});
					}
				}else{
					res.status(200).json({data: {success: false, errorCode: 3, userData: {}, message: 'Password not matched!'}});
				}
			}else{
				res.status(200).json({data: {success: false, errorCode: 2, userData: {}, message: "Email doesn't exist!"}});
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
							updatedDate: new Date(),
							processCompletion: true
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
						
		queryUser({email:req.headers.email})
			.then(adminUserInfo=>{
				let adminInfo = adminUserInfo[0];
				
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
									    text: `You have been requested to accept role of guide for ${req.headers.email}. Please Login to ${config.webHost+'//app/notifications'}, to accept the request, using your credentials: Email: ${userInfo[0].email} `,
									    html: `<p>You have been requested to accept role of guide for ${req.headers.email}.</p>
									    	<p> Please Login to ${config.webHost+'/app/notifications'}, to accept the request, using your credentials: </p>
									    	<p>Email: ${userInfo[0].email} </p>`,
									};
									sendEmail(mailOptions)
										.then(mailInfo=>{
											io.emit(userInfo[0].email+'_notifications', notificationData);
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
											let title = adminInfo.firstName+' '+adminInfo.lastName + ' has invited you to join' + adminInfo.organizationName +" on TrekEngine.com";

											let templateString = fs.readFileSync('server/templates/assignAdminsGuide.ejs', 'utf-8');
											let mailOptions = {
												from: config.appEmail.senderAddress,
											    to: guideDetails.email, 
											    subject: title,
											};
											let mailParams = { 
													title: title,
													guideFirstName: req.body.firstName,
													adminFullName: adminInfo.firstName+' '+adminInfo.lastName,
													adminCompanyName: adminInfo.organizationName,
													webhost: config.webHost,
													notificationPageLink: config.webHost+'/app/notifications',
													guideEmail: req.body.email,
													guidePassword: guideDetails.password
												};

											mailOptions.html = ejs.render(templateString, mailParams);
											mailOptions.text = htmlToText.fromString(mailOptions.html, {
											    wordwrap: 130
											});
											
											sendEmail(mailOptions)
												.then(mailInfo=>{
													console.log(mailInfo)
													io.emit(guideDetails.email+'_notifications', notificationData);
													res.status(200).send({success: true, data: {mailInfo: mailInfo, type: 'notified'} });
												})
												.catch(mailErr=>{
													console.log(mailErr)
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
			})
			.catch(adminUserErr=>{
				res.status(400).json({success:false, data: adminUserErr});
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
				sendEmail(mailOptions)
					.then(mailInfo=>{
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
			weeklyTripNotification: req.body.weeklyTripNotification,
			calendarNotification: req.body.calendarNotification,
			status: req.body.status,
			timezone: req.body.timezone
		};


		if(req.body.domain && req.body.domain.protocol && req.body.domain.website){
			req.body.domain.siteUrl = req.body.domain.protocol+req.body.domain.website;
		}
		
		if(req.headers.role === 10){
			var userId = req.body._id;
		}else{
			var userId = req.headers.userId;
		}

		User.update({_id:userId}, updateObj, (err, updateData)=>{
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
					mailOptions.html = ejs.render(templateString, { userEmail:req.body.email, webHost: config.webHost+'/change-password/token/'+token+'/reset' });
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

exports.getOauthUrl = function(req, res){
	let authUrl = [];
	let oAuthTypes = ['google', 'facebook'];
	for(let i=0; i<oAuthTypes.length; i++){
		let loginType = oAuthTypes[i];
		let oAuthOptions = {
			loginMethod: loginType,
			clientId: config[loginType]['client_id'],
			clientSecret: config[loginType]['client_secret'],
			redirectUrl: config.webHost+'/register/validate?loginType='+loginType,
		};
		if(loginType === 'google'){
			oAuthOptions.oAuthAccess = {
				access_type:'offline', 
				scope: [
					"openid", 
					"email", 
					"https://www.googleapis.com/auth/userinfo.profile", 
					"https://www.googleapis.com/auth/calendar", 
					// "https://www.googleapis.com/auth/user.birthday.read", 
					// "https://www.googleapis.com/auth/plus.login",
					// "https://www.googleapis.com/auth/plus.me"
				],
				approval_prompt: 'force',
				response_type: 'code'
			};
		}else{
			oAuthOptions.oAuthAccess = {
				scope: ["email", "public_profile"]
			};
		}

		let oAuth = new OAuthLib(oAuthOptions);
		oAuth.getOAuthUrl()
			.then(oAuthUrl=>{
				authUrl.push({loginType:loginType, url:oAuthUrl});
				if(i==(oAuthTypes.length-1)){
					res.status(200).json({success:true, data:authUrl});
				}
			});
	}
	
}

exports.validateCode = function(req, res){
	if(req.body && req.body.code){
		let oAuthOptions = {
			loginMethod: req.body.loginType,
			clientId: config[req.body.loginType]['client_id'],
			clientSecret: config[req.body.loginType]['client_secret'],
			redirectUrl: config.webHost+'/register/validate?loginType='+req.body.loginType,
			code: req.body.code
		};

		let oAuth = new OAuthLib(oAuthOptions);
		oAuth.getTokens()
			.then(oAuthTokens => {
				oAuth.getUserInfo(oAuthTokens)
					.then(userInfo=>{
						let authsType = req.body.loginType + 'Auths';
						if(req.body.email && req.body.loginType === 'google'){
							/* This is to update token information only*/
							var userUpdateObj = {
								"googleAuths.access_token":oAuthTokens.access_token, 
								"googleAuths.refresh_token":oAuthTokens.refresh_token,
								"googleAuths.token_type": oAuthTokens.token_type,
								"googleAuths.expires_in": oAuthTokens.expires_in,
								"googleAuths.id_token": oAuthTokens.id_token,
								"googleAuths.email": userInfo.email
							};
							User.update({email:req.body.email}, userUpdateObj, (err, userUpdateResp)=>{
								if(err){
									res.status(400).json({success: false, data: err});
								}else{
									res.status(200).json({success: true, data: userUpdateResp});
								}
							});
						}else{
							if(req.body.loginType === 'google'){
								var authsQuery = { "googleAuths.email": userInfo.email };
							}else if(req.body.loginType === 'facebook'){
								var authsQuery = { "facebookAuths.email": userInfo.email };
							}
							queryUser({ $or: [ { "email": userInfo.email } , authsQuery] })
								.then(users=>{
									if(users.length>0){
										if(users[0]['processCompletion']==true && users[0]['status']==true){
											let user = users[0];
											var updateUserQuery = {};
											var userUpdateObj = {
												lastLoggedIn: new Date(),
												$inc: {loginCount: 1}
											};
											userUpdateObj[authsType] = {};
											if(users[0][authsType] === undefined || users[0][authsType]['access_token'] === undefined){
												var updateUserQuery = {
													email: userInfo.email
												};
												userUpdateObj[authsType]['access_token'] = oAuthTokens.access_token;
												userUpdateObj[authsType]['refresh_token'] = oAuthTokens.refresh_token || '';
												userUpdateObj[authsType]['token_type'] = oAuthTokens.token_type ;
												userUpdateObj[authsType]['expires_in'] = oAuthTokens.expires_in;
												userUpdateObj[authsType]['id_token'] = oAuthTokens.id_token || '';
												userUpdateObj[authsType]['email'] = userInfo.email;
											}else{
												updateUserQuery[authsType+".email"] = userInfo.email ;
												userUpdateObj[authsType]['access_token'] = oAuthTokens.access_token;
												userUpdateObj[authsType]['refresh_token'] = oAuthTokens.refresh_token || '';
												userUpdateObj[authsType]['token_type'] = oAuthTokens.token_type ;
												userUpdateObj[authsType]['expires_in'] = oAuthTokens.expires_in;
												userUpdateObj[authsType]['id_token'] = oAuthTokens.id_token || '';
												userUpdateObj[authsType]['email'] = userInfo.email;
											}

											User.update(updateUserQuery, userUpdateObj, (updateErr, updateResponse)=>{
												if(updateErr){
													res.status(400).json({success: false, error: updateErr, message: "Failed to update user tokens!"});
												}else{
													PackageBillings.findOne({userId: user._id, status: true, onHold: false},(userBillingErr, billingInfo)=>{
														if(userBillingErr){
															res.status(400).json({success: false, error: userBillingErr, message: "Failed to query user billings!"});
														}else{
															if(billingInfo){
																let token = jwt.sign({
																		email: user.email, 
																		userId: user._id, 
																		userName: user.firstName,
																		role: user.role, 
																		remainingDays: billingInfo.remainingDays, 
																		packageType: billingInfo.priorityLevel
																	}, 
																	config.loginAuth.secretKey, 
																	{
																		expiresIn: config.loginAuth.expireTime, 
																		algorithm: config.loginAuth.algorithm 
																	});
																res.status(200).json({
																	success: true, 
																	data: {
																		token: token,
																		index: user.role,
																		remainingDays: billingInfo.remainingDays, 
																		packageType: billingInfo.priorityLevel,
																		email: user.email,
																		isNew: false,
																		userName: user.firstName,
																	}, 
																	message: "Authorised Successfully"
																});
															}else{
																let token = jwt.sign(
																		{email:user.email, userId: user._id, role: user.role}, 
																		config.loginAuth.secretKey, 
																		{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
																	);
																let data = {success:true, userName: user.firstName, token: token, index: user.role, email: user.email};											
																res.status(200).json({success:true, message: "Authorised Successfully", data: data});
															}
														}
													});
												}
											});
										}else{
											var updateUserQuery = {};
											updateUserQuery[authsType] = {};
											var userUpdateObj = {};
											userUpdateObj[authsType] = {};
											if(users[0][authsType] === undefined){
												var updateUserQuery = {
													email: userInfo.email
												};
												userUpdateObj[authsType]['access_token'] = oAuthTokens.access_token;
												userUpdateObj[authsType]['refresh_token'] = oAuthTokens.refresh_token || '';
												userUpdateObj[authsType]['token_type'] = oAuthTokens.token_type ;
												userUpdateObj[authsType]['expires_in'] = oAuthTokens.expires_in;
												userUpdateObj[authsType]['id_token'] = oAuthTokens.id_token || '';
												userUpdateObj[authsType]['email'] = userInfo.email;
												userUpdateObj['lastLoggedIn'] = new Date();
												userUpdateObj['loginCount'] = 1;

												User.update(updateUserQuery, userUpdateObj, (updateErr, updateResponse)=>{
													if(updateErr){
														res.status(400).json({success: false, error: updateErr, message: "Failed to update user tokens!"});
													}else{
														res.status(200).json({data:{success: true, userEmail: users[0].email, isNew: true, loginType: req.body.loginType}});
													}
												});
											}else{
												res.status(200).json({data:{success: true, userEmail: users[0].email, isNew: true, loginType: req.body.loginType}});
											}
										}
									}else{
										/* First oauth authenticaiton*/
										let userObj = {
											firstName: userInfo.given_name||userInfo.first_name,
											lastName: userInfo.family_name||userInfo.last_name,
											email: userInfo.email,
											role: 20,
											lastLoggedIn: new Date(),
											loginCount: 1

										};
										if(userInfo.gender && (userInfo.gender === 'male' || userInfo.gender === 'female')){
											userObj.gender = userInfo.gender;
										}
										if(req.body.loginType === 'google'){
											userObj.googleAuths = oAuthTokens;
											userObj.googleAuths['email'] = userInfo.email;
										}else if(req.body.loginType === 'facebook'){
											userObj.facebookAuths = oAuthTokens;
											userObj.facebookAuths['email'] = userInfo.email;
										}

										saveUser(userObj)
											.then(saveUserResp=>{
												res.status(200).json({data:{success: true, userEmail: userInfo.email, isNew: true, loginType: req.body.loginType}});
											})
											.catch(saveUserErr=>{
												res.status(200).json({data:{success: true, userEmail: userInfo.email}});
											});

									}
								}).catch(userErr=>{
									res.status(400).json({success: false, error: userErr, message: "Failed to query user!"});
								});
						}
					})
					.catch(googleUserErr=>{
						res.status(200).json({status:true, data: userInfo});
					});
			})
			.catch(tokenErr => {
				res.status(400)
				.send({
					success:false, 
					message: 'Failed to retrieve token', 
					data: tokenErr
				});
			})
	}else{
		res.status(200).send({success: false, message: 'Failed to register user'});
	}
}

exports.saveOauthUser = function(req, res){
	User.find({email: req.body.userAuths.userEmail}, (userInfoErr, userInfo)=>{
		if(userInfoErr){
			res.status(400).json({status: false, data: userInfoErr, message: 'Failed to find user.'});
		}else{
			if(userInfo.length>0){
				let userObj = userInfo[0];
				let userUpdateObj = {
					organizationName: req.body.userData.organizationName,
					status: true,
					processCompletion: true,
					timezone: req.body.userData.timezone
				};

				if(req.body.userData.domain && req.body.userData.domain.website.length>0){
					userUpdateObj.domain = req.body.userData.domain;
					userUpdateObj.domain.siteUrl = req.body.userData.domain.protocol+req.body.userData.domain.website;
				}
				User.update({email: userObj.email}, userUpdateObj, (userUpdateErr, userUpdateResp)=>{
					if(userUpdateErr){
						res.status(400).json({status: false, data: userUpdateErr, message: 'Failed to update user informations.'});
					}else{
						Packages.find({status:true}).sort({priorityLevel:-1}).limit(1).exec((packageErr, packages)=>{
							if(packageErr){
								res.status(400).json({status: false, data: packageErr, message: 'Failed to find packages'});
							}else{
								let userPackage = packages[0];
								let currentDateTime = new Date();
								currentDateTime.setHours(0,0,0,0);
								let activateDate = Math.floor(currentDateTime/1000);
								var	expireDate=0;
								expireDate = activateDate+userPackage.trialPeriod*24*3600;
								let packageObj = {
									userId: userObj._id,
									packageType: userPackage.name,
									packageCost: userPackage.cost,
									trialPeriod: userPackage.trialPeriod,
									priorityLevel: userPackage.priorityLevel,
									activatesOn: activateDate,
									expiresOn: expireDate,
									remainingDays: userPackage.trialPeriod,
									features: userPackage.featureIds,
									usesDays: 0,
									freeUser: true,
									onHold: false,
									status: true,
									packagePayment: true
								};

								saveUserPackage(packageObj)
									.then(billingInfo=>{
										let jwtTokenObj = {
											email: userObj.email, 
											userId: userObj._id, 
											role: 20, 
											remainingDays: billingInfo.remainingDays, 
											packageType: billingInfo.priorityLevel
										};
										let token = jwt.sign(
											jwtTokenObj, 
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
												index: 20, 
												remainingDays: billingInfo.remainingDays, 
												packageType: billingInfo.priorityLevel,
												email: userObj.email
											}});
									})
									.catch(billingErr=>{
										res.status(400).json({success:false, data: billingErr, message: 'Failed to save user package'});
									});
							}
						});
					}
				});
			}else{
				res.status(400).json({status: false, data: userInfoErr, message: 'Failed to find user email'});
			}
		}
	});
}

exports.getCountryList = function(req, res){
	let countries = fs.readFileSync('server/static-data/countries.json', 'utf-8');
	res.status(200).json({data:{success: true, countries: countries, message: 'All countries retrieved successfully!'}});
}

exports.getTimezoneList = function(req, res){
	getIpInfo()
		.then(ipInfo=>{
			var timezone = JSON.parse(fs.readFileSync('server/static-data/timezone.json', 'utf-8'));

			let countryCode = ipInfo.country;
			let userTimezone = timezone.find(timezoneObj=>{
				if(timezoneObj.countryCode == countryCode){
					return timezoneObj;
				}
			});
			
			if(userTimezone){
				res.status(200).json({
					data:{
						success: true, 
						userTimezone: userTimezone,
						timezone: timezone,
						message: 'All timezone retrieved successfully!'
					}
				});
			}else{
				res.status(200).json({
					data:{
						success: true, 
						userTimezone: timezone[0],
						timezone: timezone,
						message: 'All timezone retrieved successfully!'
					}
				});
			}
		});
}

const getIpInfo = ()=>{
	return new Promise(resolve=>{
		request('http://ipinfo.io', function(error, res, body) {
			resolve(JSON.parse(body));
		});
	})
}

exports.deleteUserInfo = function(req, res){
	if(req.headers && req.headers.role && req.headers.role===10){
		if(req.headers.deleteuser !== undefined){
			var deleteUserId = req.headers.deleteuser;
			User.findOne({_id: mongoose.Types.ObjectId(deleteUserId)}, (userInfoErr, userInfo)=>{
				if(userInfoErr){
					res.status(400).json({success: false, data: '', message: 'Failed to retrieve user informations'});
				}else{
					var deleteUser = new Promise((resolve, reject)=>{
						User.remove({_id: mongoose.Types.ObjectId(deleteUserId)},(deleteUserErr, deleteUser)=>{
							if(deleteUserErr){
								reject(deleteUserErr);
							}else{
								resolve(deleteUser);
							}
						});
					});

					var deleteUserBookings = new Promise((resolve, reject)=>{
						Bookings.remove({ userId: deleteUserId },(deleteBookingErr, deleteBooking)=>{
							if(deleteBookingErr){
								reject(deleteBookingErr);
							}else{
								resolve(deleteBooking);
							}
						});
					});

					var deleteUserFlights = new Promise((resolve, reject)=>{
						Flights.remove({ userId: deleteUserId },(deleteFlightErr, deleteFlightInfo)=>{
							if(deleteFlightErr){
								reject(deleteFlightErr);
							}else{
								resolve(deleteFlightInfo);
							}
						});
					});

					var deleteUserNotifications = new Promise((resolve, reject)=>{
						Notifications.remove({ sentTo: userInfo.email },(deleteNotificationsErr, deleteNotificaions)=>{
							if(deleteNotificationsErr){
								reject(deleteNotificationsErr);
							}else{
								resolve(deleteNotificaions);
							}
						});
					});

					var deleteUserPackageBillings = new Promise((resolve, reject)=>{
						PackageBillings.remove({ userId: deleteUserId },(deletePackageBillingsErr, deletePackageBillings)=>{
							if(deletePackageBillingsErr){
								reject(deletePackageBillingsErr);
							}else{
								resolve(deletePackageBillings);
							}
						});
					});

					var deleteUserTravelers = new Promise((resolve, reject)=>{
						Travelers.remove({ userId: deleteUserId },(deleteTravelersErr, deleteTravelers)=>{
							if(deleteTravelersErr){
								reject(deleteTravelersErr);
							}else{
								resolve(deleteTravelers);
							}
						});
					});

					var deleteUserTripInfos = new Promise((resolve, reject)=>{
						TripInfos.remove({ userId: deleteUserId },(deleteTripInfosErr, deleteTripInfos)=>{
							if(deleteTripInfosErr){
								reject(deleteTripInfosErr);
							}else{
								resolve(deleteTripInfos);
							}
						});
					});

					var deleteUserTrips = new Promise((resolve, reject)=>{
						Trips.remove({ userId: deleteUserId },(deleteTripsErr, deleteTrips)=>{
							if(deleteTripsErr){
								reject(deleteTripsErr);
							}else{
								resolve(deleteTrips);
							}
						});
					});

					Promise.all([
						deleteUser,
						deleteUserBookings,
						deleteUserFlights,
						deleteUserNotifications,
						deleteUserPackageBillings,
						deleteUserTravelers,
						deleteUserTripInfos,
						deleteUserTrips
					])
					.then(values=>{
						res.status(200).json({data:{success:true, data:{}, message: "successfully deleted all records."}})
					})
					.catch(reasons=>{
						res.status(400).json({success: false, data: reasons, message: "Failed to delete user records."});
					})
				}
			});
		}else{
			res.status(400).json({success: false, data: '', message: 'Delete user id is not provided'});
		}
	}else{
		res.status(400).json({success: false, data: '', message: 'Not authorized for this action'});
	}
}

exports.getAuthUserDetails = function(req, res){
	if(req.headers && req.headers.role && req.headers.role===10){
		let userId = req.query.userId;
		User.aggregate([
		    {
		        $match:{"_id" : mongoose.Types.ObjectId(userId)}
		    },
		    {
		        $project: {
		            _id: 0,
		            firstName: 1,
		            lastName: 1,
		            email: 1,
		            processCompletion: 1,
		            domain: 1,
		            organizationName: 1,
		            lastLoggedIng: 1,
		            createdDate: 1,
		            userId: userId
		        }
		    },
		    {
		        $lookup:{
		            from: "bookings",
		            localField: "userId",
		            foreignField: "userId",
		            as: "bookingInfos"
		        }
		    },
		    {
		        $lookup:{
		            from: "packagebillings",
		            localField: "userId",
		            foreignField: "userId",
		            as: "billingInfos"
		        }
		    },
		    {
		        $unwind: "$billingInfos"
		    },
		    {
			    $sort: { "billingInfos.createdDate": -1}
			},
		    {
		        $group: {
		            _id: {
		                firstName: "$firstName",
		                lastName: "$lastName",
		                email: "$email",
		                processCompletion: "$processCompletion",
		                domain: "$domain",
		                organizationName: "$organizationName",
		                lastLoggedIn: "$lastLoggedIn",
		                createdDate: "$createdDate",
		                userId: "$userId",
		                totalBookings: "$totalBookings",
		                bookingInfos: "$bookingInfos"
		            },
		            billingInfos: {
		                $push: "$billingInfos"
		            },
		            "totalSales": {
		                "$sum": {
		                    "$cond": [
		                        {"$eq": ["$billingInfos.freeUser",false]},
		                        "$billingInfos.packageCost",
		                        0 
		                    ]
		                }
		            },
		            "activePackage": {
		                "$addToSet": {
		                    "$cond": [
		                        {"$eq": ["$billingInfos.status",true]},
		                        "$billingInfos.packageType",
		                        ""
		                    ]
		                }
		            }
		        }
		    },
		    {
		        $project:{
		            _id: 0,
		            firstName: "$_id.firstName",
		            lastName: "$_id.lastName",
		            email: "$_id.email",
		            processCompletion: "$_id.processCompletion",
		            domain: "$_id.domain",
		            organizationName: "$_id.organizationName",
		            lastLoggedIng: "$_id.lastLoggedIng",
		            createdDate: "$_id.createdDate",
		            userId: "$_id.userId",
		            totalBookings: { $size: "$_id.bookingInfos" },
		            totalSales: 1,
		            billingInfos: 1,
		            activePackage:1
		        }
		    }
		]).exec((err, userInfo) => {
			if(err){
				res.status(400).json({success: true, data: '', message: 'Unable to retrieve user information'});
			}else{
				let data = {
					userInfo: userInfo[0],
					activePackage: userInfo[0]['activePackage'].join("") || []
				}
				res.status(200).json({success: true, data: data, message: 'User information retrieved successfully'});
			}
		});
	}else{
		res.status(400).json({success: false, data: '', message: 'Not authorized for this action'});
	}
}