const RequestLib = require('../request/https');
const querystring = require('querystring');

class GoogleAuthLib {

	constructor() {}

	getOAuthUrl(urlOptions){
		return new Promise((resolve)=>{
			let googleOAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
			if(urlOptions.oAuthAccess.scope == undefined){
				urlOptions.oAuthAccess.scope = ["email"];
			}else{
				urlOptions.oAuthAccess.scope = urlOptions.oAuthAccess.scope.join(" ")
			}
			if(urlOptions.oAuthAccess.response_type == undefined){
				urlOptions.oAuthAccess.response_type = 'code';
			}
			let oAuthParams = 'client_id='+urlOptions.clientId+'&redirect_uri='+urlOptions.redirectUrl;
			let oAuthUrl = googleOAuthUrl+'?'+oAuthParams+'&'+querystring.stringify(urlOptions.oAuthAccess);
			resolve(oAuthUrl);
		});
	}

	getOAuthTokens(oAuthParams){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'www.googleapis.com',
				path: '/oauth2/v4/token',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				}
			};
			let data = {
				code: oAuthParams.code,
				client_id: oAuthParams.clientId,
				client_secret: oAuthParams.clientSecret,
				grant_type: oAuthParams.grantType?oAuthParams.grantType:'authorization_code',
				redirect_uri: oAuthParams.redirectUrl
			};
			let requestLib = new RequestLib(options);
			requestLib.postRequest(data)
				.then(tokenObj=>{
					resolve(tokenObj);
				})
				.catch(tokenErr=>{
					reject(tokenErr);
				});
		});
	}

	getUserInfo(authAccessToken){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'www.googleapis.com',
				path: '/userinfo/v2/me',
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

	listCalendars(authAccessToken){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'www.googleapis.com',
				path: '/calendar/v3/users/me/calendarList',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `OAuth ${authAccessToken}`
				}
			};
			let requestLib = new RequestLib(options);
			requestLib.getRequest()
				.then(calendarLists=>{
					resolve(calendarLists);
				})
				.catch(calendarListsErr=>{
					reject(calendarListsErr);
				});
		});
	}

	createCalendar(accessToken, calendarObj){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'www.googleapis.com',
				path: '/calendar/v3/calendars',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			};
			let requestLib = new RequestLib(options);
			requestLib.postRequest(calendarObj)
				.then(insertResponse=>{
					resolve(insertResponse);
				})
				.catch(insertErr=>{
					reject(insertErr);
				});
		});
	}

	createCalendarEvent(accessToken, eventObj, calendarId){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'www.googleapis.com',
				path: `/calendar/v3/calendars/${calendarId}/events`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			};
			let requestLib = new RequestLib(options);
			requestLib.postRequest(eventObj)
				.then(insertResponse=>{
					resolve(insertResponse);
				})
				.catch(insertErr=>{
					reject(insertErr);
				});
		});
	}
}
module.exports = GoogleAuthLib;