const mongoose = require('mongoose');
const PackageBillings = mongoose.model('PackageBillings');
const AppEmail = require('../../library/appEmail/appEmail');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];

exports.submitUserPackage = function(req, res){
	var saveObj = {};
	if(req.headers && req.headers.userId){
		PackageBillings.find({userId: req.headers.userId, status:true}).sort({ activatesOn:-1}).exec((getErr, package)=>{
			if(getErr){
				res.status(400).json({success:false, data:getErr});
			}else{
				if(package.length>0){
					let activateDate = package[0]['expiresOn']+24*60*60;
					let expireDate = activateDate+(req.body.validDays*24*60*60);
					var saveObj = {
						userId: req.headers.userId,
						packageType: req.body.packageValue,
						packageCost: req.body.cost,
						activatesOn: activateDate,
						expiresOn: expireDate,
						remainingDays: req.body.validDays,
						usesDays: 0,
						freeUser: false,
						onHold: true,
						status: true
					}
				}else{
					let currentDateTime = Math.floor(new Date().getTime()/1000);
					var saveObj = {
						userId: req.headers.userId,
						packageType: req.body.packageValue,
						packageCost: req.body.cost,
						activatesOn: currentDateTime,
						expiresOn: currentDateTime+(req.body.validDays*24*60*60),
						remainingDays: req.body.validDays,
						usesDays: 0,
						freeUser: false,
						onHold: false,
						status: true
					}
				}

				let mailOptions = {};
				mailOptions = {
					from: config.appEmail.senderAddress,
				    to: req.headers.email, 
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
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
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