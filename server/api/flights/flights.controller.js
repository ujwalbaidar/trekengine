const mongoose = require('mongoose');
const Flights = mongoose.model('Flights');
const Bookings = mongoose.model('Bookings');
let AppCalendarLib = require('../users/appCalendar');
let GoogleAuthLib = require('../../library/oAuth/googleAuth');
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];

exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.bookingId = req.body.bookingId;

		Bookings.findOne({bookingId: req.body.bookingId}, (bookingErr, booking)=>{
			if(bookingErr){
				res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
			}else{
				let syncDeparture = new Promise((resolve, reject) => {
					let epocStartDate = (req.body.departure.date.epoc+(parseInt(req.body.departure.hrTime)*60*60)+(parseInt(req.body.departure.minTime)*60))*1000;
					var fullStartDateTime = new Date(epocStartDate);
					if(env === 'development'){
						let isoEpocStartDate = new Date(epocStartDate);
						let startDateGmtHours = -isoEpocStartDate.getTimezoneOffset()*60;
						let startDateTimeInSec = epocStartDate + (startDateGmtHours * 1000);
						fullStartDateTime = new Date(startDateTimeInSec);
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

					let calendarObj = {
						"summary": booking.tripName+' Flight Departure Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDateTime,
				            "timeZone": config.timezone
				        },
				        "end": {
				            "dateTime": endDateTime,
				            "timeZone": config.timezone
				        }
					};
					let appCalendarLib = new AppCalendarLib();
					appCalendarLib.saveToCalendar(req.headers.email, calendarObj)
						.then(googleCalendarObj=>{
							if(JSON.stringify(googleCalendarObj) !== "{}"){
								resolve(googleCalendarObj)
							}else{
								resolve('');
							}
						});
				}); 

				let syncArrival = new Promise((resolve, reject) => {
					let epocStartDate = (req.body.arrival.date.epoc+(parseInt(req.body.arrival.hrTime)*60*60)+(parseInt(req.body.arrival.minTime)*60))*1000;
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

					let calendarObj = {
						"summary": booking.tripName+ ' Flight Arrival Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDateTime,
				            "timeZone": config.timezone
				        },
				        "end": {
				            "dateTime": endDateTime,
				            "timeZone": config.timezone
				        }
					};
					let appCalendarLib = new AppCalendarLib();
					appCalendarLib.saveToCalendar(req.headers.email, calendarObj)
						.then(googleCalendarObj=>{
							if(JSON.stringify(googleCalendarObj) !== "{}"){
								resolve(googleCalendarObj)
							}else{
								resolve('');
							}
						});
				}); 
				Promise.all([syncDeparture, syncArrival]).then(calendarObjects => { 
					req.body.flightDepartureCalendarObj = calendarObjects[0];
					req.body.flightArrivalCalendarObj = calendarObjects[1];
					let flights = new Flights(req.body);
					
					flights.save((err, flight)=>{
						if(err){
							res.status(400).json({success:false, data:err});
						}else{
							res.status(200).json({success:true, data:flight});
						}
					});
				});
			}
		});
	
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.getAllFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		Flights.find({userId: req.headers.userId }, (err, trips)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:trips});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.getFlightsByQueryParams = function(req, res){
	if(req.headers && req.headers.userId){
		let findQuery = {userId: req.headers.userId };
		Flights.findOne(Object.assign(findQuery, req.query), (err, trips)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:trips});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.updateFlights = function(req, res){
	if(req.headers && req.headers.userId){
		let updateData = {
			departure: {
				name: req.body.departure.name,
				date: req.body.departure.date,
				hrTime: req.body.departure.hrTime,
				hrTime: req.body.departure.hrTime,
				minTime: req.body.departure.minTime,
				cost: req.body.departure.cost
			},
			arrival: {
				name: req.body.arrival.name,
				date: req.body.arrival.date,
				hrTime: req.body.arrival.hrTime,
				hrTime: req.body.arrival.hrTime,
				minTime: req.body.arrival.minTime,
				cost: req.body.arrival.cost
			},
		};
		if(req.body.flightDepartureCalendarObj && req.body.flightArrivalCalendarObj){
			updateFlightCalendar(req.body, req.headers.email)
				.then(syncCalendar=>{
					if(syncCalendar.auth === true){
						updateData.flightDepartureCalendarObj = syncCalendar.calendarObjects[0];
						updateData.flightArrivalCalendarObj = syncCalendar.calendarObjects[1];
						updateFlight({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
							.then(updateResp=>{
								res.status(200).json({success:true, data: updateResp});
							})
							.catch(updateErr=>{
								res.status(400).json({success:false, data:err});
							});
					}else{
						updateFlight({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
							.then(updateResp=>{
								res.status(200).json({success:true, data: updateResp});
							})
							.catch(updateErr=>{
								res.status(400).json({success:false, data:err});
							});
					}
				})
				.catch(calendarErr=>{
					res.status(400).json({success:false, data:calendarErr});
				});
		}else{
			updateFlight({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
				.then(updateResp=>{
					res.status(200).json({success:true, data: updateResp});
				})
				.catch(updateErr=>{
					res.status(400).json({success:false, data:err});
				})
		}
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function updateFlight(query, updateData){
	return new Promise((resolve, reject)=>{
		Flights.update(query, updateData, (err, flightUpdate)=>{
			if(err){
				reject(err);
			}else{
				resolve(flightUpdate);
			}
		});
	});
}

function updateFlightCalendar(flightData, userEmail){
	return new Promise((resolve, reject)=>{
		let appCalendarLib = new AppCalendarLib();
		appCalendarLib.queryUserTokens(userEmail)
			.then(userToken=>{
				if(userToken.hasToken == true){
					Bookings.findOne({bookingId: flightData.bookingId}, (bookingErr, booking)=>{
						if(bookingErr){
							res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
						}else{
							let syncDeparture = new Promise((resolve, reject) => {
								let epocStartDate = (flightData.departure.date.epoc+(parseInt(flightData.departure.hrTime)*60*60)+(parseInt(flightData.departure.minTime)*60))*1000;
								appCalendarLib.getCalendarDates(epocStartDate)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Flight Departure Date Time',
											"description": booking.tripName+" for "+ booking.groupName,
											"start": {
									            "dateTime": calendarDates.startDateTime,
									            "timeZone": config.timezone
									        },
									        "end": {
									            "dateTime": calendarDates.endDateTime,
									            "timeZone": config.timezone
									        }
										};
										let access_token = userToken.tokenObj.access_token;
										let calendarId = flightData.flightDepartureCalendarObj.organizer.email;
										let eventId = flightData.flightDepartureCalendarObj.id;
										let googleAuthLib = new GoogleAuthLib();
										googleAuthLib.updateCalendarEvent(access_token, calendarObj, calendarId, eventId)
											.then(googleCalendarObj=>{
												resolve(googleCalendarObj)
											});
									});
							});

							let syncArrival = new Promise((resolve, reject) => {
								let epocStartDate = (flightData.arrival.date.epoc+(parseInt(flightData.arrival.hrTime)*60*60)+(parseInt(flightData.arrival.minTime)*60))*1000;
								appCalendarLib.getCalendarDates(epocStartDate)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Flight Departure Date Time',
											"description": booking.tripName+" for "+ booking.groupName,
											"start": {
									            "dateTime": calendarDates.startDateTime,
									            "timeZone": config.timezone
									        },
									        "end": {
									            "dateTime": calendarDates.endDateTime,
									            "timeZone": config.timezone
									        }
										};
										let access_token = userToken.tokenObj.access_token;
										let calendarId = flightData.flightArrivalCalendarObj.organizer.email;
										let eventId = flightData.flightArrivalCalendarObj.id;
										let googleAuthLib = new GoogleAuthLib();
										googleAuthLib.updateCalendarEvent(access_token, calendarObj, calendarId, eventId)
											.then(googleCalendarObj=>{
												resolve(googleCalendarObj)
											});
									});
							});

							Promise.all([syncDeparture, syncArrival]).then(calendarObjects => { 
								resolve({auth:true, calendarObjects: calendarObjects});
							});
						}
					});
				}else{
					resolve({auth:false, calendarObjects: []});
				}
			});
	});
}

exports.deleteFlights = function(req, res){
	if(req.headers && req.headers.userId){
		Flights.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, flight)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:flight});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}