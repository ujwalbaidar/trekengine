const RequestLib = require('../request/https');
const querystring = require('querystring');
const request = require('request');

class FacebookAuthLib {

	constructor() {}

	getOAuthUrl(urlOptions){
		return new Promise((resolve)=>{
			let facebookOAuthUrl = "https://www.facebook.com/v2.10/dialog/oauth";
			if(urlOptions.oAuthAccess.scope == undefined){
				urlOptions.oAuthAccess.scope = ["email"];
			}else{
				urlOptions.oAuthAccess.scope = urlOptions.oAuthAccess.scope.join(" ")
			}
			if(urlOptions.oAuthAccess.response_type == undefined){
				urlOptions.oAuthAccess.response_type = 'code';
			}
			let oAuthParams = 'client_id='+urlOptions.clientId+'&redirect_uri='+urlOptions.redirectUrl;
			let oAuthUrl = facebookOAuthUrl+'?'+oAuthParams+'&'+querystring.stringify(urlOptions.oAuthAccess);
			resolve(oAuthUrl);
		});
	}

	getOAuthTokens(oAuthParams){
		return new Promise((resolve, reject)=>{
			let requestUrl = `https://graph.facebook.com/v2.10/oauth/access_token?client_id=${oAuthParams.clientId}&redirect_uri=${oAuthParams.redirectUrl}&client_secret=${oAuthParams.clientSecret}&code=${oAuthParams.code}`;
			request(requestUrl, (error, response, body)=>{
				if(error){
					reject(error);
				}else{
					resolve(body);
				}
			});
		});
	}

	getUserInfo(authAccessToken){
		return new Promise((resolve, reject) => {
			let requestUrl = `https://graph.facebook.com/v2.10/me?fields=first_name,last_name,email&access_token=${authAccessToken}`;
			request(requestUrl, (error, response, body)=>{
				if(error){
					reject(error);
				}else{
					resolve(body);
				}
			});
		});
	}

}

module.exports = FacebookAuthLib;