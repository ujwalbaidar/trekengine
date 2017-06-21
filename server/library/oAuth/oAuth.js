'use strict';
const GoogleAuthLib = require('./googleAuth');

class OAuthLib {
	constructor(oAuthOpt){
		this.oAuthOpt = oAuthOpt;
	}

	getOAuthUrl(){
		return new Promise((resolve, reject) => {
			switch (this.oAuthOpt.loginMethod){
				case 'facebook':
					console.log('login in using facebook');
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
					console.log('login in using facebook');
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
		return new Promise((resolve, reject) => {
			switch (this.oAuthOpt.loginMethod){
				case 'facebook':
					console.log('login in using facebook');
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