const mongoose = require('mongoose');
const User = mongoose.model('User');

let GoogleAuthLib = require('../../library/oAuth/googleAuth');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../configs/config')[env];

class AppCalendarLib {
	
	constructor() {}

	saveToCalendar(userEmail, calendarBodyObj){
		return new Promise((resolve, reject)=>{
			User.findOne({email: userEmail}, (err, user)=>{
				if(err){
					reject(err);
				}else{
					if(user.googleAuths && JSON.stringify(user.googleAuths) !== "{}"){
						if(user.calendarNotification){
							let notificationMinutes = (parseInt(user.calendarNotification.hrTime)>0)? parseInt(user.calendarNotification.hrTime)*60+parseInt(user.calendarNotification.minTime):parseInt(user.calendarNotification.minTime);
							calendarBodyObj.reminders = {
								useDefault : false,
								overrides: [
									{'method':'email', minutes: notificationMinutes},
									{'method':'popup', minutes: notificationMinutes}
								]
							}
						}
						let oAuthOptions = {
							clientId: config['google']['client_id'],
							clientSecret: config['google']['client_secret'],
						};

						let googleAuthLib = new GoogleAuthLib();
						googleAuthLib.checkNRefreshToken(user.googleAuths, oAuthOptions)
							.then(refhreshObj=>{
								if(refhreshObj.refreshData == true){
									User.update({ email: userEmail },{ googleAuths: refhreshObj.data}, (userUpdateErr, updateResponse)=>{
										if(userUpdateErr){
											reject(userUpdateErr);
										}else{
											this.processCalendar(refhreshObj.data.access_token, calendarBodyObj)
												.then(calendarEventObj=>{
													resolve(calendarEventObj);
												})
												.catch(calendarEventObj=>{
													reject(calendarEventObj);
												});
										}
									});
								}else{
									this.processCalendar(user.googleAuths.access_token, calendarBodyObj)
										.then(calendarEventObj=>{
											resolve(calendarEventObj);
										})
										.catch(calendarEventObj=>{
											reject(calendarEventObj);
										});
								}
							})
							.catch(tokenErr=>{
								reject(tokenErr);
							});
					
					}else{
						resolve(false);
					}
				}
			});
		});
	}

	processCalendar(accessToken, calendarBodyObj){
		return new Promise((resolve, reject)=>{
			let googleAuthLib = new GoogleAuthLib();
			googleAuthLib.listCalendars(accessToken)
				.then(calendarLists=>{
					let calendarItems = calendarLists.items;
					let hasTrekEngine = calendarItems.find(this.findCalendar);
					if(hasTrekEngine === undefined || JSON.stringify(hasTrekEngine) === "{}"){
						this.createCalendar(accessToken)
							.then(calendarObj=>{
								let calendarId = calendarObj.id;
								this.createCalendarEvent(accessToken, calendarId, calendarBodyObj)
									.then(calendarEventObj=>{
										resolve(calendarEventObj);
									})
									.catch(calendarEventObjErr=>{
										reject(calendarEventObjErr);
									});
							})
							.catch(calendarObjErr=>{
								reject(calendarObjErr);
							})
					}else{
						let calendarId = hasTrekEngine.id;
						this.createCalendarEvent(accessToken, calendarId, calendarBodyObj)
							.then(calendarEventObj=>{
								resolve(calendarEventObj);
							})
							.catch(calendarEventObjErr=>{
								reject(calendarEventObjErr);
							});
					}
				})
				.catch(calendarListsErr=>{
					reject(calendarListsErr)
				});
		});
	}

	findCalendar(calendarItem) { 
	    return calendarItem.summary === 'Trek Engine';
	}

	createCalendar(accessToken){
		return new Promise((resolve, reject)=>{
			let insertObj = {
				"summary": "Trek Engine",
				"description": "Trek Engine Calendar",
				"timezone": "Asia/Kathmandu"
			};
			let googleAuthLib = new GoogleAuthLib();
			googleAuthLib.createCalendar(accessToken, insertObj)
				.then(calendarObj=>{
					resolve(calendarObj);
				})
				.catch(calendarobjErr=>{
					reject(calendarobjErr);
				});
		});
	}

	createCalendarEvent(accessToken, calendarId, insertObj){
		return new Promise((resolve, reject)=>{
			let googleAuthLib = new GoogleAuthLib();
			googleAuthLib.createCalendarEvent(accessToken, insertObj, calendarId)
				.then(calendarEventObj=>{
					resolve(calendarEventObj);
				})
				.catch(calendarEventObjErr=>{
					reject(calendarEventObjErr);
				});
		});
	}

	getCalendarDates(dateObj, timeObj){
		return new Promise(resolve=>{
			let epocStartDate = dateObj.epoc;
			let startDateTime = new Date(epocStartDate*1000);
			startDateTime.setHours(timeObj.hrTime);
			startDateTime.setMinutes(timeObj.minTime);
			let endDateTime = new Date(startDateTime.getTime()+(1*60*60*1000));
			resolve({startDateTime: startDateTime.toISOString(), endDateTime: endDateTime.toISOString()});
		});
	}

	queryUserTokens(userEmail){
		return new Promise((resolve, reject)=>{
			User.findOne({email: userEmail}, (err, user)=>{
				if(err){
					reject(err);
				}else{
					if(user.googleAuths && JSON.stringify(user.googleAuths) !== "{}"){
						let oAuthOptions = {
							clientId: config['google']['client_id'],
							clientSecret: config['google']['client_secret'],
						};
						let googleAuthLib = new GoogleAuthLib();
						googleAuthLib.checkNRefreshToken(user.googleAuths, oAuthOptions)
							.then(refhreshObj=>{
								if(refhreshObj.refreshData == true){
									User.update({ email: userEmail },{ googleAuths: refhreshObj.data}, (userUpdateErr, updateResponse)=>{
										if(userUpdateErr){
											reject(userUpdateErr);
										}else{
											resolve({hasToken: true, tokenObj: refhreshObj, user: user});
										}
									});
								}else{
									resolve({hasToken: true, tokenObj: user.googleAuths, user: user});
								}
							})
							.catch(tokenErr=>{
								reject(tokenErr);
							});
					}else{
						resolve({hasToken: false, tokenObj: {}, user: user});
					}
				}
			});
		});
	}
}
module.exports = AppCalendarLib;