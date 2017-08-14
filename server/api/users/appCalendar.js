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

	getCalendarDates(epocStartDate){
		return new Promise(resolve=>{
			var fullStartDateTime = new Date(epocStartDate);
			if(env === 'development'){
				let isoEpocStartDate = new Date(epocStartDate);
				let startDateGmtHours = -isoEpocStartDate.getTimezoneOffset()*60;
				let startDateTimeInSec = epocStartDate + (startDateGmtHours * 1000);
				var fullStartDateTime = new Date(startDateTimeInSec);
			}

			let startDateYear = fullStartDateTime.getUTCFullYear();
			let startDateMonth = ((fullStartDateTime.getUTCMonth()+1)<10)?'0'+(fullStartDateTime.getUTCMonth()+1):fullStartDateTime.getUTCMonth()+1 ;
			let startDateDay = (fullStartDateTime.getUTCDate()<10)? '0'+fullStartDateTime.getUTCDate() : fullStartDateTime.getUTCDate() ;
			let joinStartDateArray = [startDateYear, startDateMonth, startDateDay].join('-');
			let startDateHours = (fullStartDateTime.getUTCHours()<10)? '0'+fullStartDateTime.getUTCHours() : fullStartDateTime.getUTCHours() ;
			let startTimeArray = (fullStartDateTime.getUTCMinutes()<10)? '0'+fullStartDateTime.getUTCMinutes() : fullStartDateTime.getUTCMinutes() ;
			let joinStartTimeArray = [startDateHours, startTimeArray, '00'].join(':');
			let startDateTime = [joinStartDateArray, joinStartTimeArray].join('T');

			let endDateTimeInSec = fullStartDateTime.setHours(fullStartDateTime.getHours() + 1);
			let fullEndDateTime = new Date(endDateTimeInSec);
			let endDateYear = fullEndDateTime.getUTCFullYear();
			let endDateMonth = ((fullEndDateTime.getUTCMonth()+1)<10)?'0'+(fullEndDateTime.getUTCMonth()+1):fullEndDateTime.getUTCMonth()+1 ;
			let endDateDay = (fullEndDateTime.getUTCDate()<10)? '0'+fullEndDateTime.getUTCDate() : fullEndDateTime.getUTCDate() ;
			let joinEndDateArray = [endDateYear, endDateMonth, endDateDay].join('-');
			let endDateHours = (fullEndDateTime.getUTCHours()<10)? '0'+fullEndDateTime.getUTCHours() : fullEndDateTime.getUTCHours() ;
			let endTimeArray = (fullEndDateTime.getUTCMinutes()<10)? '0'+fullEndDateTime.getUTCMinutes() : fullEndDateTime.getUTCMinutes() ;
			let joinEndTimeArray = [endDateHours, endTimeArray, '00'].join(':');
			let endDateTime = [joinEndDateArray, joinEndTimeArray].join('T');
			resolve({startDateTime:startDateTime, endDateTime:endDateTime});
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