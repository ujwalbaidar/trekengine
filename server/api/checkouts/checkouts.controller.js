const mongoose = require('mongoose');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const PaymentMethods = require('../../library/paymentMethods/paymentMethods');
const Packages = mongoose.model('Packages');

const processCheckoutPayment = (req, res)=>{
	if(req.headers && req.headers.userId){
		if(req.body.checkoutData !== undefined && req.body.checkoutData !== '{}'){
			let checkoutData = JSON.parse(req.body.checkoutData);
			let paymentMethod = req.body.paymentMethod;

			switch(checkoutData.product){
				case "package":
					processPackageCheckout(checkoutData, paymentMethod)
						.then(paymentMethodUrl=>{
							console.log(paymentMethodUrl)
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
	}else{
		res.status(400).json({data:'Invalid Token'});
	}
}

const processPackageCheckout = (packageData, paymentMethod)=>{
	return new Promise((resolve, reject)=>{
		getPackageById(packageData.productId)
			.then(selectedPackage=>{
				let paymentConfigs = config[paymentMethod.toLowerCase()];

				let paymentMethodObject = {
					clientId: paymentConfigs.client_id,
					clientSecret: paymentConfigs.client_secret,
					mode: paymentConfigs.mode,
					redirectUri: paymentConfigs.redirect_urls
				}

				let paymentMethods = new PaymentMethods(paymentMethodObject);
				paymentMethods.getPaypalOAuthUrl()
					.then(paymentUrl=>{
						resolve(paymentUrl);
					})
					.catch(paymentMethodErr=>{
						reject(paymentMethodErr);
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

module.exports = {
	processCheckoutPayment
}