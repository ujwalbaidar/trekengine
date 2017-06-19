const mongoose = require('mongoose');
const User = mongoose.model('User');

let GoogleAuthLib = require('../../library/oAuth/googleAuth');

class AppCalendarLib {
	
	constructor() {}

	saveToCalendar(email){
		let bodyObj = {
	        "summary": "Google I/O 2017",
	        "location": "800 Howard St., San Francisco, CA 94103",
	        "description": "A chance to hear more about Google's developer products.",
	        "start": {
	            "dateTime": "2017-06-19T16:00:00",
	            "timeZone": "Asia/Kathmandu"
	        },
	        "end": {
	            "dateTime": "2017-06-19T20:30:55",
	            "timeZone": "Asia/Kathmandu"
	        }
	    };

		User.findOne({email: email}, (err, user)=>{
			if(err){
				console.log("-------------------------------------------");
				console.log(user)
				console.log("-------------------------------------------")
			}else{
				if(user.googleAuths && JSON.stringify(user.googleAuths) !== "{}"){
					let googleAuthLib = new GoogleAuthLib();
					googleAuthLib.listCalendars(user.googleAuths.access_token)
						.then(calendarLists=>{
							let calendarItems = calendarLists.items;
							let hasTrekEngine = calendarItems.find(this.findCalendar);
							if(hasTrekEngine === undefined || JSON.stringify(hasTrekEngine) === "{}"){
								this.createCalendar(user.googleAuths.access_token)
									.then(calendarObj=>{
										let calendarId = calendarObj.id;
										this.createCalendarEvent(user.googleAuths.access_token, calendarId, bodyObj)
											.then(calendarEventObj=>{
												console.log("-------------------------------------------");
												console.log(calendarEventObj);
												console.log("-------------------------------------------");
											})
											.catch(calendarEventObjErr=>{
												console.log("-------------------------------------------");
												console.log(calendarEventObjErr);
												console.log("-------------------------------------------");
											})

									})
									.catch(calendarObjErr=>{
										console.log(calendarObjErr);
									})
							}else{
								let calendarId = hasTrekEngine.id;
								this.createCalendarEvent(user.googleAuths.access_token, calendarId, bodyObj)
									.then(calendarEventObj=>{
										console.log("-------------------------------------------");
										console.log(calendarEventObj);
										console.log("-------------------------------------------");
									})
									.catch(calendarEventObjErr=>{
										console.log("-------------------------------------------");
										console.log(calendarEventObjErr);
										console.log("-------------------------------------------");
									})
							}
						})
						.catch(calendarListsErr=>{
							console.log("-------------------------------------------");
							console.log(calendarListsErr)
							console.log("-------------------------------------------");
						})
				}else{
					console.log("-------------------------------------------");
					console.log('resolve empty')
					console.log("-------------------------------------------");
				}
			}
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