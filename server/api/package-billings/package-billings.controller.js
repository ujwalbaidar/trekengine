const mongoose = require('mongoose');
const PackageBillings = mongoose.model('PackageBillings');
const Packages = mongoose.model('Packages');
const Features = mongoose.model('Features');
const User = mongoose.model('User');
const AppEmail = require('../../library/appEmail/appEmail');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const fs = require('fs');
const ejs = require('ejs');

exports.getUserPackage = function(req, res){
	var billingArr = [];
	Packages.find({}, (err, packages)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			if(packages.length>0){
				var packagesLength = packages.length;
				for(let i=0; i<packages.length; i++){
					if(packages[i]['featureIds'].length>0){
						Features.find({_id:{$in:packages[i]['featureIds']}}, (featureErr, features)=>{
							if(featureErr){
								res.status(400).json({success:false, data:featureErr});
							}else{
								billingArr.push({packages:packages[i], features:features});
							}
							packagesLength--;
							if(packagesLength===0){
								res.status(200).json({success:true, data:billingArr});
							}
						});
					}else{
						billingArr.push(packages[i]);
						packagesLength--;
						if(packagesLength===0){
							res.status(200).json({success:true, data:billingArr});
						}
					}
				}
			}else{
				res.status(200).json({success:true, data:billingArr});
			}
		}
	});
}

exports.getUsersBillings = function(req, res){
	if(req.headers && req.headers.userId){
		PackageBillings.find({userId: req.headers.userId}, (err, billings)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:billings});
			}
		});
	}
}

exports.submitUserPackage = function(req, res){
	var saveObj = {};
	if(req.headers && req.headers.userId){
		if(req.headers.role === 10){
			var userId = req.body.selectedBillingUser;
		}else{
			var userId = req.headers.userId;
		}
		PackageBillings.aggregate([
		    {
		        $match:{"userId" : userId}
		    },{
		        $group:{
		            _id: null,
		            "unhold": {
		                $push:{
		                    $cond:[{ $eq: [ "$onHold", true ] }, "$$ROOT", null]
		                }
		            },
		            "active":{
		                $push:{
		                    $cond:[{ $and: [ { $eq: [ "$status", true ] }, { $eq: [ "$onHold", false ] } ] }, "$$ROOT", null]
		                }
		            }
		        }
		    }
		]).exec((billingErr, packageBillings)=>{
			if(billingErr){
				res.status(400).json({success:false, data:billingErr});
			}else{
				if(packageBillings[0]['unhold'].length>0){
					let unholdBillings = packageBillings[0]['unhold'].filter(function(i){ return i != null; })
					if(unholdBillings.length>0){
						res.status(200).json({success: true, data: 'Unable to add package. You already have account package on hold to be activated.'});
					}else{
						addUnHoldUserBilling(packageBillings[0], req.body)
					}
				}else{
					addUnHoldUserBilling(packageBillings[0], req.body)
				}
			}
		});
		/*PackageBillings.find({userId: userId, status:true}).sort({ activatesOn:-1}).exec((getErr, package)=>{
			if(getErr){
				res.status(400).json({success:false, data:getErr});
			}else{
				if(package.length == 0){
					let currentDateTime = new Date();
					currentDateTime.setHours(0,0,0,0);
					let activateDate = Math.floor(currentDateTime/1000);
					let expireDate = activateDate+parseInt(req.body.packages.days)*24*3600;

					var saveObj = {
						userId: userId,
						packageType: req.body.packages.name,
						packageCost: req.body.packages.cost,
						activatesOn: activateDate,
						expiresOn: expireDate,
						remainingDays: req.body.packages.days,
						features: req.body.packages.featureIds,
						usesDays: 0,
						freeUser: (req.body.packages.cost == 0)?true:false,
						onHold: false,
						status: true,
						packagePayment: (req.body.packages.cost == 0)?true:false
					};
					
					let mailOptions = {};
					if(req.body.selectedBillingUserEmail){
						var sendTo = req.body.selectedBillingUserEmail;
					}else{
						var sendTo = req.headers.email;
					}
					mailOptions = {
						from: config.appEmail.senderAddress,
					    to: sendTo, 
					    subject: 'Billing Receipt',
					    text: 'Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!',
					    html: `<p>Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!</p>` 
					};
					saveUserPackage(saveObj)
						.then(savePackageResponse=>{
							sendEmail(mailOptions).
							then(mailInfo=>{
								res.status(200).json({success: true, data: 'Billing for selected package is success!'});
							})
							.catch(err=>{
								res.status(400).json({success:false, data:err});
							});
						})
						.catch(err=>{
							res.status(400).json({success:false, data:err});
						});
				}else{
					if(package[0].packageCost == 0){
						PackageBillings.update({ _id: package[0]._id}, { status: false, remainingDays: 0}, (errUpdateFreeUserBilling, updateFreeUserBilling)=>{
								if(errUpdateFreeUserBilling){
									res.status(400).json({success:false, data:errUpdateFreeUserBilling});
								}else{
									let activateDate = package[0]['expiresOn'];
									let expireDate = activateDate+(req.body.packages.days*24*3600);
									var saveObj = {
										userId: userId,
										packageType: req.body.packages.name,
										packageCost: req.body.packages.cost,
										activatesOn: activateDate,
										expiresOn: expireDate,
										remainingDays: req.body.packages.days,
										features: req.body.packages.featureIds,
										usesDays: 0,
										freeUser: false,
										onHold: false,
										status: false,
										packagePayment: true
									};
									let mailOptions = {};
									if(req.body.selectedBillingUserEmail){
										var sendTo = req.body.selectedBillingUserEmail;
									}else{
										var sendTo = req.headers.email;
									}
									mailOptions = {
										from: config.appEmail.senderAddress,
									    to: sendTo, 
									    subject: 'Billing Receipt',
									    text: `Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!`,
									    html: `<p>Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!</p>` 
									};
									saveUserPackage(saveObj)
										.then(savePackageResponse=>{
											sendEmail(mailOptions).
											then(mailInfo=>{
												res.status(200).json({success: true, data: 'Billing for selected package is success!'});
											})
											.catch(err=>{
												res.status(400).json({success:false, data:err});
											});
										})
										.catch(err=>{
											res.status(400).json({success:false, data:err});
										});
								}
							});
					}else{
						if(package.length == 1){
							let activateDate = package[0]['expiresOn'];
							let expireDate = activateDate+(req.body.packages.days*24*3600);
							var saveObj = {
								userId: userId,
								packageType: req.body.packages.name,
								packageCost: req.body.packages.cost,
								activatesOn: activateDate,
								expiresOn: expireDate,
								remainingDays: req.body.packages.days,
								features: req.body.packages.featureIds,
								usesDays: 0,
								freeUser: false,
								onHold: true,
								status: true,
								packagePayment: false

							}
							let mailOptions = {};
							if(req.body.selectedBillingUserEmail){
								var sendTo = req.body.selectedBillingUserEmail;
							}else{
								var sendTo = req.headers.email;
							}
							mailOptions = {
								from: config.appEmail.senderAddress,
							    to: sendTo, 
							    subject: 'Billing Receipt',
							    text: 'Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!',
							    html: `<p>Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!</p>` 
							};
							saveUserPackage(saveObj)
								.then(savePackageResponse=>{
									sendEmail(mailOptions).
									then(mailInfo=>{
										res.status(200).json({success: true, data: 'Billing for selected package is success!'});
									})
									.catch(err=>{
										res.status(400).json({success:false, data:err});
									});
								})
								.catch(err=>{
									res.status(400).json({success:false, data:err});
								});
						}else{
							console.log(package)
							if(package[0]['usesDays'] >= 2){
								res.status(200).json({success: true, data: 'Unable to select package since you have not paid bill for old package.'});
							}else{
								res.status(200).json({success: true, data: 'Unable to select package since you already have one unused package'});
							}
						}
					}
				}
			}
		});*/
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function addUnHoldUserBilling(packageBilling, newUserBilling){
	packageBilling['active'] = packageBilling['active'].filter(function(i){ return i != null; });
	if(packageBilling['active'].length > 0){
		if(packageBilling['active'][0]['packageCost'] == 0){
			if(newUserBilling.packages.cost === 0){
				// your account is alread basic
			}else{
				// udate basic account status false
				// create new user billing account
			}
		}else{
			
			console.log(newUserBilling.packages.cost)
			console.log(packageBilling['active'][0]['packageCost'])
		}
	}else{
		// create new active billing account

	}
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

exports.updateBillingDays = function(){
		return new Promise((resolve, reject)=>{
			PackageBillings.update({
				status:true, onHold: false, remainingDays: { $gt: 0 }, packageCost: { $gt: 0 }
			},{
			    $inc:{ remainingDays:-1, usesDays:1 }
			},{
			    multi:true
			}).exec((err, update)=>{
				if(err){
					reject(err);
				}else{
					resolve(update);
				}
			});
		});
}

exports.updateBillingStatus = function() {
	return new Promise((resolve, reject)=>{
		PackageBillings.update({
			remainingDays: { $eq: 0 }
		},{
		    status: false
		},{
		    multi:true
		}).exec((err, update)=>{
			if(err){
				reject(err);
			}else{
				resolve(update);
			}
		});
	});
}

exports.updateBillingOnHold = function() {
	return new Promise((resolve, reject)=>{
		let currentDateTime = new Date();
		currentDateTime.setHours(0,0,0,0);
		let activateDate = currentDateTime.getTime()+24*3600*1000;
		let activatesOn = activateDate/1000;
		let activateDateTime = Math.floor(currentDateTime/1000);
		console.log(activateDateTime)
		PackageBillings.update({
			status: true, onHold: true, usesDays: 0, activatesOn: activateDateTime
		},{
		    onHold: false
		},{
		    multi:true
		}).exec((err, update)=>{
			if(err){
				reject(err);
			}else{
				resolve(update);
			}
		});
	});
}

exports.updateUserPackage = function(req, res){
	let updateObj = {
		userId: req.body.userId,
		packageType: req.body.packageType,
		packageCost: req.body.packageCost,
		activatesOn: req.body.activatesOn,
		expiresOn: req.body.expiresOn,
		remainingDays: req.body.remainingDays,
		usesDays: req.body.usesDays,
		features: req.body.features,
		freeUser: req.body.freeUser,
		onHold: req.body.onHold,
		status: req.body.status,
		updateDate: new Date()
	};
	PackageBillings.update({_id:req.body._id}, updateObj, function(err, updateResponse){
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success: true, data: 'Payment for Billing is set up successfully'});

		}
	});
}

exports.emailOnExpired = function(){
	return new Promise(resolve=>{
		PackageBillings.find(
			{
				status:true, 
				remainingDays:{ $lte: 2 }, 
				packageCost: { $gt: 0 }
			}, {
				_id:0, userId:1, expiresOn:1
			}, function(err, billingUser){
			if(billingUser.length>0){
				for(let i=0;i<billingUser.length; i++){
					User.findOne({_id:billingUser[i].userId},{_id:0, email:1}, (err, user)=>{
						mailOptions = {
							from: config.appEmail.senderAddress,
						    to: user.email, 
						    subject: 'Going to expire',
						    text: `Your billing for trek enging is going to expire on ${new Date(billingUser[i].expiresOn*1000).toString()}. Please renew.`,
						    html: `<p>Your billing for trek enging is going to expire on ${new Date(billingUser[i].expiresOn*1000).toString()}. Please renew.</p>` 
						};
						sendEmail(mailOptions)
							.then(mailInfo=>{
								console.log('email sent', mailInfo);
							})
							.catch(emailErr=>{
								console.log('failed to send email', emailErr);
							});
					})
				}
			}
		});
	})
}

exports.queryUserBilling = function(req, res){
	PackageBillings.find(req.query, (err, billings)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success: true, data: billings});
		}
	});
}

exports.updateUserBilling = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role===10){
		let requestBody = req.body;
		let activateDate = req.body.activatedDate.date;
		let activatesOn = new Date(activateDate.year, activateDate.month-1, activateDate.day).getTime();
		let expiryDate = req.body.expiryDate.date;
		let expiresOn = new Date(expiryDate.year, expiryDate.month-1, expiryDate.day).getTime();
		let updateObj = {
			"packageType" : requestBody.packageType,
		    "packageCost" : requestBody.packageCost,
		    "activatesOn" : activatesOn/1000,
		    "expiresOn" : expiresOn/1000,
		    "remainingDays" : requestBody.remainingDays,
		    "usesDays" : requestBody.usesDays,
		    "updateDate" : new Date(),
		    "status" : requestBody.status,
		    "onHold" : requestBody.onHold,
		    "freeUser" : requestBody.freeUser,
		};
		PackageBillings.update({_id:req.body._id, userId: req.body.userId}, updateObj, (err, updateRes)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success: true, data: updateRes});
			}
		});
	}
}

exports.deactiveUnpaidAccount = function(){
	return new Promise((resolve)=>{
		var userIds = [];
		PackageBillings.find({packagePayment:false, onHold:false, usesDays: { $gte: 2 }}, (err, billings)=>{
			if(err){
				console.log(err);
			}else{
				if(billings.length>0){
					for(let i=0; i<billings.length; i++){
						userIds.push(billings[i].userId);
						PackageBillings.update({ _id:billings[i]._id }, { onHold:true }, (updateUnpaidBillingErr, updateUnpaidBilling) => {
							if(updateUnpaidBillingErr){
								console.log(updateUnpaidBillingErr);
							}else{
								let currentDateTime = new Date();
								currentDateTime.setHours(0,0,0,0);
								let activateDate = Math.floor(currentDateTime/1000);
								let expireDate = activateDate+1*24*3600;
								var saveObj = {
									userId: billings[i].userId,
									packageType: 'Basic',
									packageCost: 0,
									activatesOn: activateDate,
									expiresOn: expireDate,
									remainingDays: 1,
									features: [],
									usesDays: 0,
									freeUser: true,
									onHold: false,
									status: true,
									packagePayment: true
								};

								saveUserPackage(saveObj)
									.then(savePackageResponse=>{
										if(i==(billings.length-1)){
											sendUnpaidBillEmail(userIds)
										}
									})
									.catch(saveErr=>{
										if(i==(billings.length-1)){
											sendUnpaidBillEmail(userIds)
										}
										console.log(saveErr)
									});
							}
						});
					}
				}
			}
		});
	});
}

function sendUnpaidBillEmail(userIds){
	User.find({_id:{$in:userIds}},{_id:0, email:1, firstName:1},(userErr, users)=>{
		if(userErr){
			console.log(userErr)
		}else{
			for(let i=0; i<users.length; i++){
				mailOptions = {
					from: config.appEmail.senderAddress,
				    to: users[i]['email'], 
				    subject: 'Switched to Basic Account',
				};
				let templateString = fs.readFileSync('server/templates/switchedToBasicAccount.ejs', 'utf-8');
				mailOptions.html = ejs.render(templateString, { userName: users[i]['firstName'] });
				sendEmail(mailOptions)
					.then(mailInfo=>{
						console.log('email sent', mailInfo);
					})
					.catch(emailErr=>{
						console.log('failed to send email', emailErr);
					});
			}
		}
	})
}



/*let activateDate = package[0]['expiresOn'];
					let expireDate = activateDate+(req.body.packages.days*24*3600);
					var saveObj = {
						userId: userId,
						packageType: req.body.packages.name,
						packageCost: req.body.packages.cost,
						activatesOn: activateDate,
						expiresOn: expireDate,
						remainingDays: req.body.packages.days,
						features: req.body.packages.featureIds,
						usesDays: 0,
						freeUser: false,
						onHold: true,
						status: true
					}
					let mailOptions = {};
					if(req.body.selectedBillingUserEmail){
						var sendTo = req.body.selectedBillingUserEmail;
					}else{
						var sendTo = req.headers.email;
					}
					mailOptions = {
						from: config.appEmail.senderAddress,
					    to: sendTo, 
					    subject: 'Billing Receipt',
					    text: 'Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!',
					    html: `<p>Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!</p>` 
					};
					saveUserPackage(saveObj)
						.then(savePackageResponse=>{
							sendEmail(mailOptions).
							then(mailInfo=>{
								res.status(200).json({success: true, data: 'Billing for selected package is success!'});
							})
							.catch(err=>{
								res.status(400).json({success:false, data:err});
							});
						})
						.catch(err=>{
							res.status(400).json({success:false, data:err});
						});*/