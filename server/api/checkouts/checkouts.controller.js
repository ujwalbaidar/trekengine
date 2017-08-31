const mongoose = require('mongoose');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const PaymentMethods = require('../../library/paymentMethods/paymentMethods');
const Packages = mongoose.model('Packages');
const paypal = require('paypal-rest-sdk');
const PackageBillings = mongoose.model('PackageBillings');

const processCheckoutPayment = (req, res)=>{
	if(req.headers && req.headers.userId){
		PackageBillings.find({userId: req.headers.userId, status: true, onHold: true}, (findBillingErr, findBilling)=>{
			if(findBillingErr){
				res.status(400).send({status: false, data: findBillingErr, msg: 'Failed to obtain billings'});
			}else{
				if(findBilling.length>0){
					res.status(200).send({data:{success: false, data:{}, msg:'Existance of On hold account to be used.'}})
				}else{
					if(req.body.checkoutData !== undefined && req.body.checkoutData !== '{}'){
						let checkoutData = JSON.parse(req.body.checkoutData);
						let paymentMethod = req.body.paymentMethod;

						switch(checkoutData.product){
							case "package":
								processPackageCheckout(checkoutData, paymentMethod, req)
									.then(paymentMethodUrl=>{
										res.status(200).json({data:{success:true, url: paymentMethodUrl, message: ''}});
									})
									.catch(paymentMethodUrlErr=>{
										res.status(400).json({success: false, data: paymentMethodUrlErr});
									})
								break;
							default:
								
								break;
						}
					}else{
						res.status(200).json({data:{success: false, checkoutData: {}, msg:'Failed to Identify Checkout Items' }});
					}
				}
			}
		});
	}else{
		res.status(400).json({data:'Invalid Token'});
	}
}

const processPackageCheckout = (packageData, paymentMethod, req)=>{
	return new Promise((resolve, reject)=>{
		getPackageById(packageData.productId)
			.then(selectedPackage=>{
				let itemDetails = {
			        "name": selectedPackage.name + " Package",
			        "description": packageData.billingType + " billing for " + selectedPackage.name + " Package",
			        "currency": "USD"
			    };
			    if(packageData.billingType === 'annual'){
			    	itemDetails.price = 12 * parseInt(selectedPackage.annualCost);
			    }else{
			    	itemDetails.price = selectedPackage.cost;
			    }

				let paymentConfigs = config[paymentMethod.toLowerCase()];

				let paymentMethodObject = {
					clientId: paymentConfigs.client_id,
					clientSecret: paymentConfigs.client_secret,
					mode: paymentConfigs.mode,
					redirectUri: paymentConfigs.redirect_urls
				};

				let paymentMethods = new PaymentMethods(paymentMethodObject);
				paymentMethods.processPaypalCheckouts(itemDetails, packageData.productId, req.headers.userId, packageData.billingType)
					.then(paypalRespObj=>{
						if(paypalRespObj.payer.payment_method === 'paypal') {
							for(var i=0; i < paypalRespObj.links.length; i++) {
								var link = paypalRespObj.links[i];
								if (link.method === 'REDIRECT') {
									resolve(link.href);
								}
							}
						}
					})
					.catch(paypalRespObjErr=>{
						reject(paypalRespObjErr);
					});
			})
			.catch(packageErr=>{
				reject(packageErr);
			});
	});
}

const getPackageById = (packageId)=>{
	return new Promise((resolve, reject)=>{
		Packages.find({_id: mongoose.Types.ObjectId(packageId)}, (err, packages)=>{
			if(err){
				reject(err);
			}else{
				if(packages.length>0){
					resolve(packages[0]);
				}else{
					reject({msg: 'Product Id in unidentified.'});
				}
			}
		});
	});
}

const submitCheckoutInfos = (req, res)=>{
	var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };

    paypal.payment.execute(paymentId, payerId, (error, payment)=>{
    	if(error){
            res.status(400).send({data:error, msg:'Failed to complete package transaction'});
    	}else{
    		PackageBillings.find({userId: req.params.userId, status: true, remainingDays: {$gt:0}}, (findBillingErr, findBilling)=>{
    			if(findBillingErr){
					res.status(400).send({data:findBillingErr, msg:'Failed to get user billing Info.'});
    			}else{
    				if(findBilling.length>0){
    					var onHold = true;
    				}else{
    					var onHold = false;
    				}
		    		getPackageById(req.params.productId)
			    		.then(selectedPackage=>{
				    		let currentDateTime = new Date();
							currentDateTime.setHours(0,0,0,0);
							let activateDate = Math.floor(currentDateTime/1000);
							if(req.params.billingType === 'annual'){
								var expireDate = activateDate+365*24*3600;
							}else{
								var expireDate = activateDate+parseInt(selectedPackage.days)*24*3600;
							}
							var saveObj = {
								userId: req.params.userId,
								packageType: selectedPackage.name,
								packageCost: payment.transactions[0]['amount']['total'],
								activatesOn: activateDate,
								expiresOn: expireDate,
								usesDays: 0,
								freeUser: false,
								onHold: onHold,
								status: true,
								packagePayment: true,
								paymentInfo: payment.payer,
								priorityLevel: selectedPackage.priorityLevel,
							};

							if(req.params.billingType === 'annual'){
								saveObj.remainingDays = 365;
							}else{
								saveObj.remainingDays = selectedPackage.days;
							}

							let packageBillings = new PackageBillings(saveObj);
							packageBillings.save((err, savePackage)=>{
								if(err){
									res.status(400).json({success:false, data: err, msg: 'failed to save user data'});
								}else{
		    						res.redirect('/app/checkout/success/true');
								}
							});
						})
						.catch(packageErr=>{
							res.status(400).send({data:packageErr, msg:'Failed to get package detail of proviede product id.'});
						});
    			}
    		})
    	}
    });
}

module.exports = {
	processCheckoutPayment,
	submitCheckoutInfos
}