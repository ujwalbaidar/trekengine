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

	getPaypalOAuthUrl(){
		return new Promise((resolve, reject)=>{
			this.getPaypalTokens()
				.then(paypalTokens=>{
					let authorizationToken = paypalTokens.token_type+' '+paypalTokens.access_token;
					this.getPaypalRedirectUrl(authorizationToken)
						.then(paypalAuths=>{
							resolve(paypalAuths);
						})
						.catch(paypalAuthsErr=>{
							reject(paypalAuthsErr);
						});
				})
				.catch(paypalTokensErr=>{
					reject(paypalTokensErr)
				});
		/*	let paypalCredentials = {
				'host': 'api.sandbox.paypal.com',
				'port': '',
				'client_id': this.clientId,
				'client_secret': this.clientSecret
			};
			paypal.configure(paypalCredentials);

			var payment = {
					"intent": "sale",
					"payer": {
						"payment_method": "paypal"
					},
					"redirect_urls": this.redirectUri,
					"transactions": [{
						"item_list": {
								"items": [{
								"name": "item",
								"sku": "item",
								"price": "10.00",
								"currency": "USD",
								"quantity": 1
							}]
						},
						"amount": {
							"currency": "USD",
							"total": "10.00"
						},
						"description": "This is the payment description."
					}]
			};

			paypal.payment.create(payment, function (error, payment) {
			    if (error) {
			        reject(error);
			    } else {
			        for(var i=0; i < payment.links.length; i++) {
						var link = payment.links[i];
						if (link.method === 'REDIRECT') {
							resolve(link.href)
						}
					}
			    }
			});*/
		});
	}

	getPaypalTokens(){
		return new Promise((resolve, reject)=>{
			let stringifyPostData = querystring.stringify({
				"grant_type": 'client_credentials'
			});

			let postheaders = {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + new Buffer(this.clientId + ':' + this.clientSecret).toString('base64'),
				'Content-Length': stringifyPostData.length
			};

			let optionspost = {
				host : 'api.sandbox.paypal.com',
				path : '/v1/oauth2/token',
				method : 'POST',
				headers : postheaders
			};
			
			let data = '';

            let req = https.request(optionspost, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            let dataObj = JSON.parse(data);
                            resolve(dataObj);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(data);
                    }
                });
            });

            req.on('error', (e) => {
                reject(`${e.message}`);
            });
            req.write(stringifyPostData);
            req.end();
		});
	}

	getPaypalRedirectUrl(authToken){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'api.sandbox.paypal.com',
				path: '/v1/payments/payment',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authToken
				}
			};
			/*let eventObj = {
				"intent": "sale",
				"payer": {
					"payment_method": "paypal"
				},
				"transactions": [
					{
						"amount": {
							"total": "30.11",
							"currency": "USD",
							"details": {
								"subtotal": "30.00",
								"tax": "0.07",
								"shipping": "0.03",
								"handling_fee": "1.00",
								"shipping_discount": "-1.00",
								"insurance": "0.01"
							}
						},
						"description": "The payment transaction description.",
						"custom": "EBAY_EMS_90048630024435",
						"invoice_number": "48787589673",
						"payment_options": {
							"allowed_payment_method": "INSTANT_FUNDING_SOURCE"
						},
						"soft_descriptor": "ECHI5786786",
						"item_list": {
							"items": [
								{
									"name": "hat",
									"description": "Brown hat.",
									"quantity": "5",
									"price": "3",
									"tax": "0.01",
									"sku": "1",
									"currency": "USD"
								},
								{
									"name": "handbag",
									"description": "Black handbag.",
									"quantity": "1",
									"price": "15",
									"tax": "0.02",
									"sku": "product34",
									"currency": "USD"
								}
							],
							"shipping_address": {
								"recipient_name": "Brian Robinson",
								"line1": "4th Floor",
								"line2": "Unit #34",
								"city": "San Jose",
								"country_code": "US",
								"postal_code": "95131",
								"phone": "011862212345678",
								"state": "CA"
							}
						}
					}
				],
				"note_to_payer": "Contact us for any questions on your order.",
				"redirect_urls": this.redirectUri
			};*/

			let eventObj = {
					"intent": "sale",
					"payer": {
						"payment_method": "paypal"
					},
					"redirect_urls": this.redirectUri,
					"transactions": [{
						"item_list": {
								"items": [{
								"name": "item",
								"sku": "item",
								"price": "10.00",
								"currency": "USD",
								"quantity": 1
							}]
						},
						"amount": {
							"currency": "USD",
							"total": "10.00"
						},
						"description": "This is the payment description."
					}]
			};
			let requestLib = new RequestLib(options);
			requestLib.postRequest(eventObj)
				.then(paypalRedirectUrl=>{
					for(var i=0; i < paypalRedirectUrl.links.length; i++) {
						var link = paypalRedirectUrl.links[i];
						if (link.method === 'REDIRECT') {
							resolve({sessionId: paypalRedirectUrl.id})
						}
					}
				})
				.catch(paypalRedirectUrlErr=>{
					reject(paypalRedirectUrlErr)
				});
		});
	}
}

module.exports = PaymentMethods;