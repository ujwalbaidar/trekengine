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
const AppEmail = require('../../library/appEmail/appEmail');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

exports.createUser = function(req, res){
	req.body.firstName = req.body.fname;
	req.body.lastName = req.body.lname;
	req.body.role = req.body.role?req.body.role:20;
	req.body.domain = req.body.domain;
	req.body.createdDate = new Date();
	req.body.updatedDate = new Date();
	req.body.password = crypto.createHmac(config.loginPassword.algorithm, config.loginPassword.secretKey)
                   .update(req.body.password)
                   .digest('hex');
	let user = new User(req.body);


	if(req.body.serviceType){
		var serviceType = req.body.serviceType;
		if(req.body.serviceType == 'free'){
			var serviceType ='Enterprise';
		}
		Packages.find({name:serviceType}, (packageErr, package)=>{
			if(packageErr){
				res.status(400).json({success:false, data:err});
			}else{
				if(package.length>0){
					user.save((err, user)=>{
						if(err){
							res.status(400).json({success:false, data:err});
						}else{
							let userInfo = {
								userId: user._id,
								email: user.email
							};
							let packageService = true;
							saveUserPackageBilling(userInfo, package[0], packageService)
								.then(billingResponse=>{
									user.billingResponse = billingResponse;
									res.status(200).json({success:true, data:{user:user,billingInfo:billingResponse}});
								})
								.catch(billingError=>{
									res.status(400).json({success:false, data:err});
								})
						}
					});
				}else{
					res.status(400).json({success:false, data:'Selected Package is Invalid'});
				}
			}
		})
	}else{
		user.save((err, user)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:user});
			}
		});
	}
	
	
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
	User.find(req.query, (err, users)=>{
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
					if (user.role==10 || user.role==20) {
						PackageBillings.findOne({userId:user._id, status: true, onHold: false}, (billingErr, billingResponse)=>{
							if (billingErr) {
								res.status(400).json({success:false, message:"Failed to verify billingSetup!", data:{errorCode:'emailErr'}});
							}else{
								let token = jwt.sign(
										{email:user.email, userId: user._id, role: user.role, remainingDays: billingResponse.remainingDays, packageType: billingResponse.packageType}, 
										config.loginAuth.secretKey, 
										{expiresIn: config.loginAuth.expireTime, algorithm: config.loginAuth.algorithm }
									);
								res.status(200).json({success:true, message: "Authorised Successfully", data: {token: token, index: user.role, remainingDays: billingResponse.remainingDays, packageType: billingResponse.packageType}});
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
		    subject: 'Billing Receipt',
		    text: 'Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!',
		    html: `<p>Payment for ${saveObj.packageType} package, worth $${saveObj.packageCost} has been successfully received!</p>` 
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