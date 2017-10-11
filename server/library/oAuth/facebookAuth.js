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

	/*listCalendars(authAccessToken){
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

	checkNRefreshToken(googleTokens, oAuthOptions){
		return new Promise((resolve, reject)=>{
			let options = {
				hostname: 'www.googleapis.com',
				path: `/oauth2/v3/tokeninfo?access_token=${googleTokens.access_token}`,
				headers: {
					'Content-Type': 'application/json',
				}
			};
			let requestLib = new RequestLib(options);
			requestLib.getRequest()
				.then(validToken=>{
					resolve({refreshData:false, data: {}})
				})
				.catch(invalidToken=>{
					this.refreshAccessToken(googleTokens, oAuthOptions)
						.then(refreshToken=>{
							refreshToken.email = googleTokens.email;
							refreshToken.refresh_token = googleTokens.refresh_token;
							resolve({refreshData:true, data:refreshToken});
						})
						.catch(refreshTokenErr=>{
							reject(refreshTokenErr);
						});
				});
		});
	}

	refreshAccessToken(googleTokens, oAuthOptions){
		return new Promise((resolve, reject) => {
			let options = {
				hostname: 'www.googleapis.com',
				path: '/oauth2/v4/token',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			};
			let data = {
				"client_id": oAuthOptions.clientId,
				"client_secret": oAuthOptions.clientSecret,
				"refresh_token":googleTokens.refresh_token,
				"grant_type": "refresh_token"
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

	updateCalendarEvent(accessToken, eventObj, calendarId, eventId){
		return new Promise((resolve, reject)=>{
			let options = {
				method: 'PUT',
				json: eventObj,
				url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			};
			request(options, (err, httpResponse, body) =>{
				if (err) {
					reject(err);
				}else{
					resolve(body);
				}
			});
		});
	}

	deleteCalendarEvent(accessToken, calendarId, eventId){
		return new Promise((resolve, reject)=>{
			let options = {
				method: 'DELETE',
				url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			};

			request(options, (err, httpResponse, body) =>{
				if (err) {
					reject(err);
				}else{
					resolve(body);
				}
			});
		});
	}*/
}

module.exports = FacebookAuthLib;