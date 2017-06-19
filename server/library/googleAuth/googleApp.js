const googleAuth = require('google-auth-library');
const RequestLib = require('../request/https');

class GoogleAuthApp {

	constructor(config) {
		this.auth = new googleAuth();
		this.oauth2Client = new this.auth.OAuth2(config.client_id, config.client_secret, config.redirect_url);
	}

	accessUrl(urlOptions){
		if(urlOptions==undefined || urlOptions.scope == undefined){
			urlOptions.scope = ["email"];
		}
  		let authUrl = this.oauth2Client.generateAuthUrl(urlOptions);
		return authUrl;
	}

	getGoogleTokens(googleAuthCode){
		return new Promise((resolve, reject)=>{
			this.oauth2Client.getToken(googleAuthCode, (err, googleTokens) => {
				if(err){
					reject(err);
				}else{
					resolve(googleTokens);
				}
			});
		});
	}

	getGoogleUserInfo(authAccessToken){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'www.googleapis.com',
				path: '/oauth2/v2/userinfo',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `OAuth ${authAccessToken}`
				}
			};

			let requestLib = new RequestLib(options);
			requestLib.getRequest()
				.then(userInfo=>{
					resolve(userInfo);
				})
				.catch(userInfoErr=>{
					reject(userInfoErr);
				});
		});
	}
}
module.exports = GoogleAuthApp;