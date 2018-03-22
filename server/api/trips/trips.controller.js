const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');
const Travelers = mongoose.model('Travelers');
const Bookings = mongoose.model('Bookings');
const User = mongoose.model('User');
const Feedbackmessage = mongoose.model('Feedbackmessage');

const AppEmail = require('../../library/appEmail/appEmail');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const fs = require('fs');
const ejs = require('ejs');
let AppCalendarLib = require('../users/appCalendar');
let GoogleAuthLib = require('../../library/oAuth/googleAuth');
const htmlToText = require('html-to-text');

exports.createTrips = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.userEmail = req.headers.email;
		let trips = new Trips(req.body);
		Bookings.findOne({bookingId: req.body.bookingId}, (bookingErr, booking)=>{
			if(bookingErr){
				res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
			}else{
				User.findOne({_id: mongoose.Types.ObjectId(req.headers.userId)}, (userErr, user)=>{
					let syncDeparture = new Promise((resolve, reject) => {
						let epocStartDate = req.body.departureDate.epoc;
						let startDateTime = new Date(epocStartDate*1000);
						startDateTime.setHours(req.body.departureTime.hrTime);
						startDateTime.setMinutes(req.body.departureTime.minTime);
						let endDateTime = new Date(startDateTime.getTime()+(1*60*60*1000));

						let calendarObj = {
							"summary": booking.tripName+' Departure Date Time',
							"description": booking.tripName+" for "+ booking.groupName,
							"start": {
					            "dateTime": startDateTime,
					            "timeZone": user.timezone.zoneName||config.timezone
					        },
					        "end": {
					            "dateTime": endDateTime,
					            "timeZone": user.timezone.zoneName||config.timezone
					        }
						};

						let appCalendarLib = new AppCalendarLib();
						appCalendarLib.saveToCalendar(req.headers.email, calendarObj, true)
							.then(googleCalendarObj=>{
								if(JSON.stringify(googleCalendarObj) !== "{}"){
									resolve(googleCalendarObj)
								}else{
									resolve('');
								}
							});
					}); 

					let syncArrival = new Promise((resolve, reject) => {
						let epocStartDate = req.body.arrivalDate.epoc;
						let startDateTime = new Date(epocStartDate*1000);
						startDateTime.setHours(req.body.arrivalTime.hrTime);
						startDateTime.setMinutes(req.body.arrivalTime.minTime);
						let endDateTime = new Date(startDateTime.getTime()+(1*60*60*1000));

						let calendarObj = {
							"summary": booking.tripName+' Departure Date Time',
							"description": booking.tripName+" for "+ booking.groupName,
							"start": {
					            "dateTime": startDateTime,
					            "timeZone": user.timezone.zoneName||config.timezone
					        },
					        "end": {
					            "dateTime": endDateTime,
					            "timeZone": user.timezone.zoneName||config.timezone
					        }
						};

						let appCalendarLib = new AppCalendarLib();
						appCalendarLib.saveToCalendar(req.headers.email, calendarObj, false)
							.then(googleCalendarObj=>{
								if(JSON.stringify(googleCalendarObj) !== "{}"){
									resolve(googleCalendarObj)
								}else{
									resolve('');
								}
							});
					}); 
					Promise.all([syncDeparture, syncArrival]).then(calendarObjects => { 
						req.body.departureCalendarObj = calendarObjects[0];
						req.body.arrivalCalendarObj = calendarObjects[1];
						let trips = new Trips(req.body);
						trips.save((err, trip)=>{
							if(err){
								res.status(400).json({success:false, data:err});
							}else{
								res.status(200).json({success:true, data:trip});
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

exports.getAllTrips = function(req, res) {
	if(req.headers && req.headers.userId){
		Trips.find({userId: req.headers.userId }, (err, trips)=>{
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

exports.getTrip = function(req, res){
	if(req.headers && req.headers.userId){
		getTripByQuery(req.query)
			.then(trip=>{
				res.status(200).json({success:true, data: trip});
			})
			.catch(tripErr=>{
				res.status(400).json({success:false, data: err});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function getTripByQuery(query){
	return new Promise((resolve, reject)=>{
		Trips.find(query, (err, trip)=>{
			if(err){
				reject(err);
			}else{
				resolve(trip);
			}
		});
	});
}

exports.updateTrips = function(req, res){
	if(req.headers && req.headers.userId){
		let updateData = {
			departureDate: req.body.departureDate,
			arrivalDate: req.body.arrivalDate,
			status: req.body.status,
			userEmail: req.headers.email,
			departureTime: req.body.departureTime,
			arrivalTime: req.body.arrivalTime,
			updateDate: new Date()
		};

		if(req.body.departureCalendarObj && req.body.arrivalCalendarObj){
			updateTripCalendar(req.body, req.body.userEmail)
				.then(syncCalendar=>{
					if(syncCalendar.auth === true){
						updateData.departureCalendarObj = syncCalendar.calendarObjects[0];
						updateData.arrivalCalendarObj = syncCalendar.calendarObjects[1];
						updateTrip({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
							.then(updateResp=>{
								res.status(200).json({success:true, data: updateResp});
							})
							.catch(updateErr=>{
								res.status(400).json({success:false, data:err});
							});
					}else{
						updateTrip({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
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
			updateTrip({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData)
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

function updateTrip(query, updateData){
	return new Promise((resolve, reject)=>{
		Trips.update(query, updateData, (err, tripUpdate)=>{
			if(err){
				reject(err);
			}else{
				resolve(tripUpdate);
			}
		});
	});
}

function updateTripCalendar(tripData, userEmail){
	return new Promise((resolve, reject)=>{
		let appCalendarLib = new AppCalendarLib();
		appCalendarLib.queryUserTokens(userEmail)
			.then(userToken=>{
				let userTimezone = userToken.user.timezone.zoneName || config.timezone;
				if(userToken.hasToken == true){
					Bookings.findOne({bookingId: tripData.bookingId}, (bookingErr, booking)=>{
						if(bookingErr){
							res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
						}else{
							let syncDeparture = new Promise((resolve, reject) => {
								appCalendarLib.getCalendarDates(tripData.departureDate, tripData.departureTime)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Departure Date Time',
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
										let calendarId = tripData.departureCalendarObj.organizer.email;
										let eventId = tripData.departureCalendarObj.id;
										let googleAuthLib = new GoogleAuthLib();
										googleAuthLib.updateCalendarEvent(access_token, calendarObj, calendarId, eventId)
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
								appCalendarLib.getCalendarDates(tripData.arrivalDate, tripData.arrivalTime)
									.then(calendarDates=>{
										let calendarObj = {
											"summary": booking.tripName+' Arrival Date Time',
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
										let calendarId = tripData.arrivalCalendarObj.organizer.email;
										let eventId = tripData.arrivalCalendarObj.id;
										let googleAuthLib = new GoogleAuthLib();
										googleAuthLib.updateCalendarEvent(access_token, calendarObj, calendarId, eventId)
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

exports.deleteTrips = function(req, res){
	if(req.headers && req.headers.userId){
		Trips.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, trip)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:trip});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.filterTrip = function(req, res){
	if(req.headers && req.headers.userId){
		let departureDate = JSON.parse(req.query.departureDate).epoc;
		let arrivalDate = JSON.parse(req.query.arrivalDate).epoc;
		let limit = 20;
		let skip = (req.query.queryPage * limit);
		getFilterResultQuery(departureDate, arrivalDate, req.query.filterType)
			.then(result=>{
				filterByDates(req.headers.email, req.headers.role, req.query.selectorQuery, result, skip, limit)
				.then(trips=>{
					getUserArr(req.headers)
						.then(selectorArr=>{
							trips.totalData = Math.ceil(trips.totalData/limit);
							trips.selectorArr = selectorArr;
							res.status(200).json({success:true, data:trips});
						})
						.catch(userErr=>{
							res.status(400).json({success:false, data:userErr});
						});
				})
				.catch(err=>{
					res.status(400).json({success:false, data:err});
				});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function filterByDates(userEmail, userRole, selectorQuery, Result, skip, limit){
	return new Promise((resolve, reject)=>{
		if(userRole == 30){
			if(selectorQuery && JSON.parse(selectorQuery).email.length>0){
				var matchQuery = {
			        $match:{
			            $and:[{"selectedGuide" : userEmail},{"userEmail" : JSON.parse(selectorQuery).email},{"status":true}]
			        }
			    };
			}else{
				var matchQuery = {
			        $match:{
			            $and:[{"selectedGuide" : userEmail},{"status":true}]
			        }
			    };
			}
		}
		if(userRole == 20){
			var matchQuery = {
		        $match:{
		            $and:[{"userEmail" : userEmail},{"status":true}]
		        }
		    };
		}
		var dbQuery = [
	    	matchQuery,
	    	{
		        $lookup:{
		            from: "trips",
		            localField: "bookingId",
		            foreignField: "bookingId",
		            as: "trip"
		        }
		    },{
		        $unwind:"$trip"
		    },{
		        $project:{
		            _id:0,
		            groupName:1,
		            tripName:1,
		            userEmail:1,
		            userEmail:1,
		            bookingId: 1,
		            status:1,
		            selectedGuide:1,
		            "trip.departureDate":1,
		            "trip.arrivalDate":1,
		            "result": Result
		        }
		    },{
		        $match: {"result": true}
		    },{
		        "$lookup":{
		            "from":"users",
		            "localField":"userEmail",
		            "foreignField":"email",
		            "as":"users"
		        }
		    },{
		        $unwind:"$users"
		    },{
		        $project:{
		            groupName:1,
		            tripName:1,
		            userEmail:1,
		            userEmail:1,
		            bookingId: 1,
		            status:1,
		            selectedGuide: 1,
		            "trip.departureDate":1,
		            "trip.arrivalDate":1,
		            "users.organizationName":1
		        }
		    },{
		        $sort:{"trip.departureDate.epoc":1, "trip.arrivalDate.epoc":1}
		    }
		];
		var aggregateQuery = Bookings.aggregate(dbQuery);
		aggregateQuery.exec((err, response)=>{
			if(err){
				reject(err);
			}else{
				if (response.length>0) {
					countMovementsQuery(aggregateQuery, skip, limit).then(movementsData=>{
						resolve({totalData:response.length, data: movementsData});
					}).catch(movementsDataErr=>{
						reject(movementsDataErr);
					});
				}else{
					resolve({totalData:0, data: []})
				}
			}
		});
	});
}

function countMovementsQuery(cursor, skip, limit){
	return new Promise((resolve,reject)=>{
		cursor.skip(skip).limit(limit).exec((err, response)=>{
			if(err){
				reject(err);
			}else{
				resolve(response);
			}
		});
	});
}

function getUserArr(headers){
	if(headers.role === 20){
		var project = { _id:0, guides:1 }
	}else if(headers.role === 30){
		var project = { _id:0, admins: 1 }
	}else{
		var project = { _id:0}
	}
	return new Promise((resolve, reject)=>{
		User.find({email:headers.email}, project, (err, user)=>{
			if(err){
				reject(err);
			}else{
				if(headers.role === 30){
					var emails = user[0]['admins'];
				}else{
					var emails = user[0]['guides'];
				}

				if(emails.length > 0){
					User.find({ email: { $in: emails } }, { _id:0, email:1, organizationName:1 }, (userErr, userInfo)=>{
						if(userErr){
							reject(userErr);
						}else{
							resolve(userInfo);
						}
					});
				}else{
					resolve([]);
				}
			}
		})
	});
}

function getFilterResultQuery(departureDate, arrivalDate, filterType){
	return new Promise(resolve=>{
		if(filterType == 'upcoming'){
			var result = {
				$or: [ 
					{ $gte: [ "$trip.departureDate.epoc", departureDate ] },
					{ $gte: [ "$trip.arrivalDate.epoc", arrivalDate ] }
				]
			};
		}else{
			var result = {
	      		$or:[{
	      			$and: [ { $gte: [ "$trip.departureDate.epoc", departureDate ] }, { $lte: [ "$trip.departureDate.epoc", arrivalDate ] } ]
	        	},{
	            	$and: [ { $gte: [ "$trip.arrivalDate.epoc", departureDate ] }, { $lt: [ "$trip.arrivalDate.epoc", arrivalDate ] } ]
	        	}]
	  		};
		}
  		resolve(result);
	});
}

exports.dailyTripNotification = function(){
	var tomorrowDate = (new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(0,0,0,0))/1000;
	Trips.aggregate([
		{
	        $match:{
	            $or:[
	                {"departureDate.epoc": { $eq: tomorrowDate } },
	                { "arrivalDate.epoc": { $eq: tomorrowDate } } 
	            ]
	        }
	    },{
	    	$lookup:{
		      	from: "users",
				localField: "userEmail",
				foreignField: "email",
				as: "users"
		    }
	   	},{
	       	$lookup:{
				from: "bookings",
				localField: "bookingId",
				foreignField: "bookingId",
				as: "bookings"
	        }
	   	},{ 
			"$unwind": "$users" 
	   	},{
	       "$unwind": "$bookings"
	   	},{
	       	$match:{
	           "status": true
	       	}
	   	},{
	       $match:{
	           "users.status": true,
	           "users.dailyTripNotification": true
	       }
	   	},{
	       "$project": {
	       		"_id": 0,
				"userEmail": 1,
				"users.firstName": 1,
				"departureDate.epoc": 1,
				"arrivalDate.epoc": 1,
				"bookings.bookingId": 1,
				"bookings.groupName": 1,
				"bookings.tripName": 1,
				"bookings.travellerCount": 1
	       }
	   	},{
	        $group:{
	            _id:"$userEmail",
	            userName: {$addToSet:"$users.firstName"},
	            "departures": { 
	            	$push: {
	            		$cond: [{ $eq: [ "$departureDate.epoc", tomorrowDate ] }, "$$ROOT", null]
	            	} 
	            },
	            "arrivals": { 
	            	$push: {
	            		$cond: [{ $eq: [ "$arrivalDate.epoc", tomorrowDate ] }, "$$ROOT", null]
	            	}
	            }
	        }
	    }
	]).exec((err, tripData)=>{
		if(err){
			res.status(400).send(err)
		}else{
			if(tripData.length>0){
				for (var trips of tripData) {
					trips.departures = trips.departures.filter(function(i){ return i != null; });
					trips.arrivals = trips.arrivals.filter(function(i){ return i != null; });
					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: trips._id, 
					    subject: `Tomorrow's Trip Details`
					};
				    let templateString = fs.readFileSync('server/templates/dailyTripNotification.ejs', 'utf-8');
					mailOptions.html = ejs.render(templateString, { trip : trips });
					config.appEmail.mailOptions = mailOptions;
					let appEmail = new AppEmail(config.appEmail);
					appEmail.sendEmail()
						.then(emailInfo=>{
							console.log(emailInfo);
						})
						.catch(emailError=>{
							console.log(emailError);
						});
				}
			}
		}
	})
}

exports.weeklyTripNotification = function(){
	let curr = new Date();
	let first = curr.getDate() - curr.getDay();
	let last = first + 6;

	let firstDayOfWeek = (new Date(curr.setDate(first))).setHours(0,0,0,0)/1000;
	let lastDayOfWeek = (new Date(curr.setDate(last))).setHours(0,0,0,0)/1000;
	Trips.aggregate([{
	       	$match:{
	           "status": true
	       	}
	   	},{
			$project:{
	            "bookingId": 1,
	            "departureDate": 1,
	            "arrivalDate": 1,
	            "userEmail": 1,
	            "result": {
	            	$or: [{
	            		$and: [{ $gte: [ "$departureDate.epoc", firstDayOfWeek ] },{ $lte: [ "$departureDate.epoc", lastDayOfWeek ] }]
	            	},{
	            		$and: [{ $gte: [ "$arrivalDate.epoc", firstDayOfWeek ] },{ $lte: [ "$arrivalDate.epoc", lastDayOfWeek ] }]
	            	}]
	            }
	        }
		},{
			$match:{
				result: true
			}
		},{
	    	$lookup:{
		      	from: "users",
				localField: "userEmail",
				foreignField: "email",
				as: "users"
		    }
	   	},{
	       	$lookup:{
				from: "bookings",
				localField: "bookingId",
				foreignField: "bookingId",
				as: "bookings"
	        }
	   	},{ 
			"$unwind": "$users" 
	   	},{
	       "$unwind": "$bookings"
	   	},{
	       $match:{
	           "users.status": true,
	           "users.weeklyTripNotification": true
	       }
	   	},{
	       "$project": {
	       		"_id": 0,
				"userEmail": 1,
				"users.firstName": 1,
				"departureDate.epoc": 1,
				"arrivalDate.epoc": 1,
				"bookings.bookingId": 1,
				"bookings.groupName": 1,
				"bookings.tripName": 1,
				"bookings.travellerCount": 1
	       }
	   	},{
	        $group:{
	            _id:"$userEmail",
	            userName: {$addToSet:"$users.firstName"},
	            "departures": { 
	            	$push: {
	            		$cond: [{ $and: [{ $gte: [ "$departureDate.epoc", firstDayOfWeek ] },{ $lte: [ "$departureDate.epoc", lastDayOfWeek ] }] }, "$$ROOT", null]
	            	} 
	            },
	            "arrivals": { 
	            	$push: {
	            		$cond: [{ $and: [{ $gte: [ "$arrivalDate.epoc", firstDayOfWeek ] },{ $lte: [ "$arrivalDate.epoc", lastDayOfWeek ] }] }, "$$ROOT", null]
	            	}
	            }
	        }
	    }
	]).exec((err, tripData) =>{
		if(err){
			console.log(err);
		}else{
			if(tripData.length>0){
				for (var trips of tripData) {
					trips.departures = trips.departures.filter(function(i){ return i != null; });
					trips.arrivals = trips.arrivals.filter(function(i){ return i != null; });
					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: trips._id, 
					    subject: `Week's Trip Details`
					};
				    let templateString = fs.readFileSync('server/templates/weeklyTripNotification.ejs', 'utf-8');
					mailOptions.html = ejs.render(templateString, { trip : trips });
					config.appEmail.mailOptions = mailOptions;
					let appEmail = new AppEmail(config.appEmail);
					appEmail.sendEmail()
						.then(emailInfo=>{
							console.log(emailInfo);
						})
						.catch(emailError=>{
							console.log(emailError);
						});
				}
			}
		}
	});
}

exports.guideDailyTripNotification = function(){
	var tomorrowDate = (new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(0,0,0,0))/1000;
	Trips.aggregate([
	    {
	        $match:{
	            $or:[
	                {"departureDate.epoc": { $eq: tomorrowDate } },
	                { "arrivalDate.epoc": { $eq: tomorrowDate } } 
	            ]
	        }
	    },
	    {
	        $match:{
	            status:true
	        }
	    },
	    {
	        $lookup:{
	            from: "bookings",
	            localField: "bookingId",
	            foreignField: "bookingId",
	            as: "bookings"
	        }
	    },
	    {
	        $unwind:"$bookings"
	    },
	    {
	        $lookup:{
	            from: "users",
	            localField: "bookings.selectedGuide",
	            foreignField: "email",
	            as: "users"
	        }
	    },
	    {
	        $unwind: "$users"
	    },
	    {
	        $match:{
	            $and: [
	                { "users.status": { $eq: true } },
	                { "users.role": { $eq: 30 } },
	                { "users.dailyTripNotification": { $eq: true } }
	            ]
	        }
	    },
	    {
	       "$project": {
	            "_id": 0,
	            "users.email": 1,
	            "users.firstName": 1,
	            "departureDate.epoc": 1,
	            "arrivalDate.epoc": 1,
	            "bookingId": 1,
	            "bookings.groupName": 1,
	            "bookings.tripName": 1,
	            "bookings.travellerCount": 1
	       }
	    },
	    {
	        $group:{
	            _id:"$users.email",
	            userName: {$addToSet:"$users.firstName"},
	            "departures": { 
	                $push: {
	                    $cond: [{ $eq: [ "$departureDate.epoc", tomorrowDate ] }, "$$ROOT", null]
	                } 
	            },
	            "arrivals": { 
	                $push: {
	                    $cond: [{ $eq: [ "$arrivalDate.epoc", tomorrowDate ] }, "$$ROOT", null]
	                }
	            }
	        }
	    }
	]).exec((err, tripData)=>{
		if(err){
			res.status(400).send(err)
		}else{
			if(tripData.length>0){
				for (var trips of tripData) {
					trips.departures = trips.departures.filter(function(i){ return i != null; });
					trips.arrivals = trips.arrivals.filter(function(i){ return i != null; });
					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: trips._id, 
					    subject: `Tomorrow's Trip Details`
					};
				    let templateString = fs.readFileSync('server/templates/dailyTripNotification.ejs', 'utf-8');
					mailOptions.html = ejs.render(templateString, { trip : trips });
					config.appEmail.mailOptions = mailOptions;
					let appEmail = new AppEmail(config.appEmail);
					appEmail.sendEmail()
						.then(emailInfo=>{
							console.log(emailInfo);
						})
						.catch(emailError=>{
							console.log(emailError);
						});
				}
			}
		}
	});
}

exports.guideWeeklyTripNotification = function(){
	let curr = new Date();
	let first = curr.getDate() - curr.getDay();
	let last = first + 6;

	let firstDayOfWeek = (new Date(curr.setDate(first))).setHours(0,0,0,0)/1000;
	let lastDayOfWeek = (new Date(curr.setDate(last))).setHours(0,0,0,0)/1000;

	Trips.aggregate([
	    {
	        $match:{
	            "status": true
	        }
	    },
	    {
	        $project:{
	            "bookingId": 1,
	            "departureDate": 1,
	            "arrivalDate": 1,
	            "userEmail": 1,
	            "result": {
	                $or: [{
	                        $and: [{ $gte: [ "$departureDate.epoc", firstDayOfWeek ] },{ $lte: [ "$departureDate.epoc", lastDayOfWeek ] }]
	                },{
	                        $and: [{ $gte: [ "$arrivalDate.epoc", firstDayOfWeek ] },{ $lte: [ "$arrivalDate.epoc", lastDayOfWeek ] }]
	                }]
	            }
	        }
	    },
	    {
	        $match:{
	            result: true
	        }
	    },{
	        $lookup:{
	            from: "bookings",
	            localField: "bookingId",
	            foreignField: "bookingId",
	            as: "bookings"
	        }
	    },
	    {
	        $unwind: "$bookings"
	    },
	    {
	        $lookup:{
	            from: "users",
	            localField: "bookings.selectedGuide",
	            foreignField: "email",
	            as: "users"
	        }
	    },
	    {
	        $unwind: "$users"
	    },
	    {
	        $match:{
	            $and: [
	                { "users.status": { $eq: true } },
	                { "users.role": { $eq: 30 } },
	                { "users.weeklyTripNotification": { $eq: true } }
	            ]
	        }
	    },
	    {
	       "$project": {
	            "_id": 0,
	            "users.email": 1,
	            "users.firstName": 1,
	            "departureDate.epoc": 1,
	            "arrivalDate.epoc": 1,
	            "bookingId": 1,
	            "bookings.groupName": 1,
	            "bookings.tripName": 1,
	            "bookings.travellerCount": 1
	       }
	    },
	    {
	        $group:{
	            _id:"$users.email",
	            userName: {$addToSet:"$users.firstName"},
	            "departures": { 
	                $push: {
	                    $cond: [{ $and: [{ $gte: [ "$departureDate.epoc", firstDayOfWeek ] },{ $lte: [ "$departureDate.epoc", lastDayOfWeek ] }] }, "$$ROOT", null]
	                } 
	            },
	            "arrivals": { 
	                $push: {
	                    $cond: [{ $and: [{ $gte: [ "$arrivalDate.epoc", firstDayOfWeek ] },{ $lte: [ "$arrivalDate.epoc", lastDayOfWeek ] }] }, "$$ROOT", null]
	                }
	            }
	        }
	    }
	]).exec((err, tripData) =>{
		if(err){
			console.log(err);
		}else{
			if(tripData.length>0){
				for (var trips of tripData) {
					trips.departures = trips.departures.filter(function(i){ return i != null; });
					trips.arrivals = trips.arrivals.filter(function(i){ return i != null; });
					let mailOptions = {
						from: config.appEmail.senderAddress,
					    to: trips._id, 
					    subject: `Week's Trip Details`
					};
				    let templateString = fs.readFileSync('server/templates/weeklyTripNotification.ejs', 'utf-8');
					mailOptions.html = ejs.render(templateString, { trip : trips });
					config.appEmail.mailOptions = mailOptions;
					let appEmail = new AppEmail(config.appEmail);
					appEmail.sendEmail()
						.then(emailInfo=>{
							console.log(emailInfo);
						})
						.catch(emailError=>{
							console.log(emailError);
						});
				}
			}
		}
	});
}

exports.requestTripFeedback = function(){
	var currentFullDate = new Date();
	currentFullDate.setDate(currentFullDate.getDate() - 5);
	let queryYear = currentFullDate.getFullYear();
	let queryMonth = (currentFullDate.getMonth()+1)<10?'0'+(currentFullDate.getMonth()+1):(currentFullDate.getMonth()+1);
	let queryDate = (currentFullDate.getDate())<10?'0'+(currentFullDate.getDate()):(currentFullDate.getDate());
	let queryFullDate = `${queryDate}-${queryMonth}-${queryYear}`;

	Trips.find({"arrivalDate.formatted":queryFullDate}, (err, trips) => {
		if(err){
			console.log(err)
		}else{
			if(trips.length>0){
				for(let i=0; i<trips.length; i++){
					getFeedbackUserLists(trips[i].userId, trips[i].bookingId)
						.then(feedbackArray=>{
							let travelerListArr = feedbackArray[0].toString();
							let feedbackRequestMsg = feedbackArray[1];
							
							if(travelerListArr.length>0 && feedbackRequestMsg !== null){
								let mailOptions = {
									from: config.appEmail.senderAddress,
								    to: travelerListArr, 
								    subject: 'Feedback About Trip',
								    html: feedbackRequestMsg['message']
								};
								mailOptions.text = htmlToText.fromString(mailOptions.html, {
									wordwrap: 130
								});
								config.appEmail.mailOptions = mailOptions;

								let appEmail = new AppEmail(config.appEmail);
								appEmail.sendEmail()
									.then(mailInfo=>{
										console.log(mailInfo)
									})
									.catch(err=>{
										console.log(err)
									});
							}
						})
						.catch(feedbackArrayErr=>{
							console.log("send feedback request message error:", feedbackArrayErr)
						});
				}
			}
		}
	})
}

function getFeedbackUserLists(userId, bookingId){
	return new Promise((resolve, reject)=>{
		let promise1 = new Promise((resolve, reject) => {
			let travelersEmail = [];
			Travelers.find({userId: userId, bookingId: bookingId}, {email:1, _id:0} ,(err, travelers) =>{
				if(err){
					reject(err);
				}else{
					if(travelers.length > 0){
						for(let i=0; i< travelers.length; i++){
							travelersEmail.push(travelers[i].email);
							if(i === (travelers.length-1)){
								resolve(travelersEmail);							
							}
						}
					}
				}
			});
		});

		let promise2 = new Promise((resolve, reject) => {
			Feedbackmessage.findOne({userId: userId}, {_id:0, message:1}, (err, feedbackMessage) => {
				if(err){
					reject(err)
				}else{
					resolve(feedbackMessage);
				}
			});
		});
		Promise.all([promise1, promise2])
			.then((values)=>{
				resolve(values)
			})
			.catch(reason=>{
				reject(reason);
			});
	});
}

