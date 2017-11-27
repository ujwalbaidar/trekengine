'use strict';
const GoogleAuthLib = require('./googleAuth');
const FacebookAuthLib = require('./facebookAuth');

class OAuthLib {
	constructor(oAuthOpt){
		this.oAuthOpt = oAuthOpt;
	}

	getOAuthUrl(){
		return new Promise((resolve, reject) => {
			switch (this.oAuthOpt.loginMethod){
				case 'facebook':
					let facebookAuthLib = new FacebookAuthLib();
					facebookAuthLib.getOAuthUrl(this.oAuthOpt)
						.then(oAuthUrl=>{
							resolve(oAuthUrl);
						});
					break;
				case 'google':
					let googleAuthLib = new GoogleAuthLib();
					googleAuthLib.getOAuthUrl(this.oAuthOpt)
						.then(oAuthUrl=>{
							resolve(oAuthUrl);
						});
					break;
				default:
					reject({"Error": "Login Method Not Defined!!"});
					break;
			}
		});
	}
	
	getTokens(){
		return new Promise((resolve, reject) => {
			switch (this.oAuthOpt.loginMethod){
				case 'facebook':
					let facebookAuthLib = new FacebookAuthLib();
					facebookAuthLib.getOAuthTokens(this.oAuthOpt)
						.then(oAuthTokens=>{
							if(typeof oAuthTokens === 'string'){
								var oAuthTokens = JSON.parse(oAuthTokens);
							}
							resolve(oAuthTokens);
						});
					break;
				case 'google':
					let googleAuthLib = new GoogleAuthLib();
					googleAuthLib.getOAuthTokens(this.oAuthOpt)
						.then(oAuthUrl=>{
							resolve(oAuthUrl);
						})
						.catch(tokenErr=>{
							reject(tokenErr);
						});
					break;
				default:
					reject({"Error": "Login Method Not Defined!!"});
					break;
			}
		});
	}

	getUserInfo(oAuthTokens){
		if(typeof oAuthTokens === 'string'){
			var oAuthTokens = JSON.parse(oAuthTokens);
		}
		return new Promise((resolve, reject) => {
			switch (this.oAuthOpt.loginMethod){
				case 'facebook':
					let facebookAuthLib = new FacebookAuthLib();
					facebookAuthLib.getUserInfo(oAuthTokens.access_token)
						.then(userInfo=>{
							if(typeof userInfo === 'string'){
								var userInfo = JSON.parse(userInfo);
							}
							resolve(userInfo);
						});
					break;
				case 'google':
					let googleAuthLib = new GoogleAuthLib();
					googleAuthLib.getUserInfo(oAuthTokens.access_token)
						.then(oAuthUrl=>{
							resolve(oAuthUrl);
						});
					break;
				default:
					reject({"Error": "Login Method Not Defined!!"});
					break;
			}
		});
	}
}
module.exports = OAuthLib;