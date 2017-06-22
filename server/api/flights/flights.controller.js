const mongoose = require('mongoose');
const Flights = mongoose.model('Flights');
const Bookings = mongoose.model('Bookings');
let AppCalendarLib = require('../users/appCalendar');

exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.bookingId = req.body.bookingId;

		Bookings.findOne({bookingId: req.body.bookingId}, (bookingErr, booking)=>{
			if(bookingErr){
				res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
			}else{
				let syncDeparture = new Promise((resolve, reject) => {
					let startDateEpoc = req.body.departure.date.epoc+(parseInt(req.body.departure.hrTime)*60*60)+(parseInt(req.body.departure.minTime)*60);
					let startDateNew = new Date(startDateEpoc*1000);
					let reverseStartDate = startDateNew.toLocaleDateString().split('/').reverse();
					let startDateYear = reverseStartDate[0];
					let startDateMonth = (reverseStartDate[2]<10)?'0'+reverseStartDate[2]:reverseStartDate[2];
					let startDateDate = (reverseStartDate[1]<10)?'0'+reverseStartDate[1]:reverseStartDate[1];
					let startTime = (startDateNew.toTimeString().split(" "))[0]
					let startDate = [startDateYear, startDateMonth, startDateDate].join("-");
					let startDateTime = [startDate, startTime].join('T');

					let endDateEpoc = startDateEpoc+3600;
					let endDateNew = new Date(endDateEpoc*1000);
					let reverseEndDate = endDateNew.toLocaleDateString().split('/').reverse();
					let endDateYear = reverseEndDate[0];
					let endDateMonth = (reverseEndDate[2]<10)?'0'+reverseEndDate[2]:reverseEndDate[2];
					let endDateDate = (reverseEndDate[1]<10)?'0'+reverseEndDate[1]:reverseEndDate[1];
					let endTime = (endDateNew.toTimeString().split(" "))[0]
					let endDate = [endDateYear, endDateMonth, endDateDate].join("-");
					let endDateTime = [endDate, endTime].join('T');

					let calendarObj = {
						"summary": booking.tripName+' Flight Departure Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDateTime,
				            "timeZone": "Asia/Kathmandu"
				        },
				        "end": {
				            "dateTime": endDateTime,
				            "timeZone": "Asia/Kathmandu"
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
					let startDateEpoc = req.body.arrival.date.epoc+(parseInt(req.body.arrival.hrTime)*60*60)+(parseInt(req.body.arrival.minTime)*60);
					let startDateNew = new Date(startDateEpoc*1000);
					let reverseStartDate = startDateNew.toLocaleDateString().split('/').reverse();
					let startDateYear = reverseStartDate[0];
					let startDateMonth = (reverseStartDate[2]<10)?'0'+reverseStartDate[2]:reverseStartDate[2];
					let startDateDate = (reverseStartDate[1]<10)?'0'+reverseStartDate[1]:reverseStartDate[1];
					let startTime = (startDateNew.toTimeString().split(" "))[0]
					let startDate = [startDateYear, startDateMonth, startDateDate].join("-");
					let startDateTime = [startDate, startTime].join('T');

					let endDateEpoc = startDateEpoc+3600;
					let endDateNew = new Date(endDateEpoc*1000);
					let reverseEndDate = endDateNew.toLocaleDateString().split('/').reverse();
					let endDateYear = reverseEndDate[0];
					let endDateMonth = (reverseEndDate[2]<10)?'0'+reverseEndDate[2]:reverseEndDate[2];
					let endDateDate = (reverseEndDate[1]<10)?'0'+reverseEndDate[1]:reverseEndDate[1];
					let endTime = (endDateNew.toTimeString().split(" "))[0]
					let endDate = [endDateYear, endDateMonth, endDateDate].join("-");
					let endDateTime = [endDate, endTime].join('T');

					let calendarObj = {
						"summary": booking.tripName+ ' Flight Arrival Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDateTime,
				            "timeZone": "Asia/Kathmandu"
				        },
				        "end": {
				            "dateTime": endDateTime,
				            "timeZone": "Asia/Kathmandu"
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
		Flights.update({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData, {upsert: true}, (err, flightUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:flightUpdate});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
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