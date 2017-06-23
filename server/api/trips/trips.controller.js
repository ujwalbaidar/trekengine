const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');
const Bookings = mongoose.model('Bookings');
const User = mongoose.model('User');
const AppEmail = require('../../library/appEmail/appEmail');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const fs = require('fs');
const ejs = require('ejs');
let AppCalendarLib = require('../users/appCalendar');

exports.createTrips = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.userEmail = req.headers.email;
		let trips = new Trips(req.body);
		Bookings.findOne({bookingId: req.body.bookingId}, (bookingErr, booking)=>{
			if(bookingErr){
				res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
			}else{
				let syncDeparture = new Promise((resolve, reject) => {
					let epocStartDate = (req.body.departureDate.epoc+(parseInt(req.body.departureTime.hrTime)*60*60)+(parseInt(req.body.departureTime.minTime)*60))*1000;

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
						"summary": booking.tripName+' Departure Date Time',
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
					let epocStartDate = (req.body.arrivalDate.epoc+(parseInt(req.body.arrivalTime.hrTime)*60*60)+(parseInt(req.body.arrivalTime.minTime)*60))*1000;
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
						"summary": booking.tripName+' Departure Date Time',
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
		Trips.update({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData, {upsert: true}, (err, tripUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data: tripUpdate});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
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