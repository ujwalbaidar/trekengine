const mongoose = require('mongoose');
const Flights = mongoose.model('Flights');
const Bookings = mongoose.model('Bookings');
let AppCalendarLib = require('../users/appCalendar');
let GoogleAuthLib = require('../../library/oAuth/googleAuth');
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const User = mongoose.model('User');

exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.bookingId = req.body.bookingId;

		Bookings.findOne({bookingId: req.body.bookingId}, (bookingErr, booking)=>{
			if(bookingErr){
				res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
			}else{
				User.findOne({_id: mongoose.Types.ObjectId(req.headers.userId)}, (userErr, user)=>{
					let userTimezone = user.timezone.zoneName || config.timezone;
					let syncDeparture = new Promise((resolve, reject) => {
						let departureTimeObj = {
							hrTime: req.body.departure.hrTime,
							minTime: req.body.departure.minTime
						};
						let appCalendarLib = new AppCalendarLib();
						appCalendarLib.getCalendarDates(req.body.departure.date, departureTimeObj)
							.then(calendarDates=>{
								
								let calendarObj = {
									"summary": booking.tripName+' Flight Departure Date Time',
									"description": booking.tripName+" for "+ booking.groupName,
									"start": {
							            "dateTime": calendarDates.startDateTime,
							            "timeZone": userTimezone
							        },
							        "end": {
							            "dateTime": calendarDates.endDateTime,
							            "timeZone": userTimezone
							        }
								};
								appCalendarLib.saveToCalendar(req.headers.email, calendarObj)
									.then(googleCalendarObj=>{
										if(JSON.stringify(googleCalendarObj) !== "{}"){
											resolve(googleCalendarObj)
										}else{
											resolve('');
										}
									});
							});
					}); 

					let syncArrival = new Promise((resolve, reject) => {
						let arrivalTimeObj = {
							hrTime: req.body.arrival.hrTime,
							minTime: req.body.arrival.minTime
						};
						let appCalendarLib = new AppCalendarLib();
						appCalendarLib.getCalendarDates(req.body.arrival.date, arrivalTimeObj)
							.then(calendarDates=>{
								let userTimezone = user.timezone.zoneName || config.timezone;
								let calendarObj = {
									"summary": booking.tripName+ ' Flight Arrival Date Time',
									"description": booking.tripName+" for "+ booking.groupName,
									"start": {
							            "dateTime": calendarDates.startDateTime,
							            "timeZone": userTimezone
							        },
							        "end": {
							            "dateTime": calendarDates.endDateTime,
							            "timeZone": userTimezone
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
							let userTimezone = userToken.user.timezone.zoneName || config.timezone;
							let syncDeparture = new Promise((resolve, reject) => {
								let departureTimeObj = {
									hrTime: flightData.departure.hrTime,
									minTime: flightData.departure.minTime
								};
								appCalendarLib.getCalendarDates(flightData.departure.date, departureTimeObj)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Flight Departure Date Time',
											"description": booking.tripName+" for "+ booking.groupName,
											"start": {
									            "dateTime": calendarDates.startDateTime,
									            "timeZone": userTimezone
									        },
									        "end": {
									            "dateTime": calendarDates.endDateTime,
									            "timeZone": userTimezone
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
								let arrivalTimeObj = {
									hrTime: flightData.arrival.hrTime,
									minTime: flightData.arrival.minTime
								};
								
								appCalendarLib.getCalendarDates(flightData.arrival.date, arrivalTimeObj)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Flight Departure Date Time',
											"description": booking.tripName+" for "+ booking.groupName,
											"start": {
									            "dateTime": calendarDates.startDateTime,
									            "timeZone": userTimezone
									        },
									        "end": {
									            "dateTime": calendarDates.endDateTime,
									            "timeZone": userTimezone
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