'use strict';
const paypal = require('paypal-rest-sdk');
const querystring = require('querystring');
const https = require('https');
const RequestLib = require('../request/https');

class PaymentMethods {
	constructor(paymentObjs){
		this.clientId = paymentObjs.clientId;
		this.clientSecret = paymentObjs.clientSecret;
		this.redirectUri = paymentObjs.redirectUri;
		this.mode = paymentObjs.mode || '';
	}

	processPaypalCheckouts(itemDetails, productId, userId, billingType){
		return new Promise((resolve, reject)=>{
			paypal.configure({
				'mode': 'sandbox',
				'client_id': this.clientId,
				'client_secret': this.clientSecret
			});
			let create_payment_json = {
				"intent": "sale",
				"payer": {
					"payment_method": "paypal"
				},
				"transactions": [{
			        "amount": {
			            "total": itemDetails.price,
			            "currency": "USD",
			        },
			        "item_list": {
			            "items": [{
			                "name": itemDetails.name,
			                "price": itemDetails.price,
			                "currency": "USD",
			                "quantity": 1,
			            }]
			        },
			        "description": itemDetails.description
			    }],
				"note_to_payer": "Contact us for any questions on your order.",
				"redirect_urls": {
					"return_url": `${this.redirectUri.return_url}/product/${productId}/user/${userId}/billing/${billingType}`,
					"cancel_url": this.redirectUri.cancel_url
				}
			};
			paypal.payment.create(create_payment_json, function (error, paypalObj) {
				if (error) {
				    reject(error);
				} else {
				    resolve(paypalObj);
				}
			});
		});
	}
}

module.exports = PaymentMethods;