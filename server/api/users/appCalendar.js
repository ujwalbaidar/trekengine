const mongoose = require('mongoose');
const User = mongoose.model('User');

let GoogleAuthLib = require('../../library/oAuth/googleAuth');

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
					
						let googleAuthLib = new GoogleAuthLib();
						googleAuthLib.listCalendars(user.googleAuths.access_token)
							.then(calendarLists=>{
								let calendarItems = calendarLists.items;
								let hasTrekEngine = calendarItems.find(this.findCalendar);
								if(hasTrekEngine === undefined || JSON.stringify(hasTrekEngine) === "{}"){
									this.createCalendar(user.googleAuths.access_token)
										.then(calendarObj=>{
											let calendarId = calendarObj.id;
											this.createCalendarEvent(user.googleAuths.access_token, calendarId, calendarBodyObj)
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
									this.createCalendarEvent(user.googleAuths.access_token, calendarId, calendarBodyObj)
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
							})
					}else{
						resolve(false);
					}
				}
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
}
module.exports = AppCalendarLib;