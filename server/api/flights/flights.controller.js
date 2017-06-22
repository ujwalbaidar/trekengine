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
					let startDateYear = startDateNew.getFullYear();
					let startDateMonth = ((startDateNew.getMonth()+1)<10)?'0'+(startDateNew.getMonth()+1):(startDateNew.getMonth()+1);
					let startDateDate = (startDateNew.getDate()<10)?'0'+startDateNew.getDate():startDateNew.getDate();
					let startDateTime = req.body.departure.hrTime+':'+req.body.departure.minTime+':00';
					let startDate = startDateYear+'-'+startDateMonth+'-'+startDateDate+'T'+startDateTime;

					let endDateEpoc = startDateEpoc+3600;
					let endDateNew = new Date(endDateEpoc*1000);
					let endDateYear = endDateNew.getFullYear();
					let endDateMonth = ((endDateNew.getMonth()+1)<10)?'0'+(endDateNew.getMonth()+1):(endDateNew.getMonth()+1);
					let endDateDate = (endDateNew.getDate()<10)?'0'+endDateNew.getDate():endDateNew.getDate();
					let endDateHours = (endDateNew.getHours()<10)?'0'+endDateNew.getHours():endDateNew.getHours();
					let endDateMinutes = (endDateNew.getMinutes()<10)?'0'+endDateNew.getMinutes():endDateNew.getMinutes();
					let endDateTime = endDateHours+':'+endDateMinutes+':00'
					let endDate = endDateYear+'-'+endDateMonth+'-'+endDateDate+'T'+endDateTime;
					let calendarObj = {
						"summary": booking.tripName+' Flight Departure Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDate,
				            "timeZone": "Asia/Kathmandu"
				        },
				        "end": {
				            "dateTime": endDate,
				            "timeZone": "Asia/Kathmandu"
				        }
					};
					let appCalendarLib = new AppCalendarLib();
					appCalendarLib.saveToCalendar(req.headers.email, calendarObj)
						.then(googleCalendarObj=>{
							if(JSON.stringify(googleCalendarObj) !== "{}"){
								resolve(googleCalendarObj.id)
							}else{
								resolve('');
							}
						});
				}); 

				let syncArrival = new Promise((resolve, reject) => {
					let startDateEpoc = req.body.arrival.date.epoc+(parseInt(req.body.arrival.hrTime)*60*60)+(parseInt(req.body.arrival.minTime)*60);
					let startDateNew = new Date(startDateEpoc*1000);
					let startDateYear = startDateNew.getFullYear();
					let startDateMonth = ((startDateNew.getMonth()+1)<10)?'0'+(startDateNew.getMonth()+1):(startDateNew.getMonth()+1);
					let startDateDate = (startDateNew.getDate()<10)?'0'+startDateNew.getDate():startDateNew.getDate();
					let startDateTime = req.body.arrival.hrTime+':'+req.body.arrival.minTime+':00';
					let startDate = startDateYear+'-'+startDateMonth+'-'+startDateDate+'T'+startDateTime;

					let endDateEpoc = startDateEpoc+3600;
					let endDateNew = new Date(endDateEpoc*1000);
					let endDateYear = endDateNew.getFullYear();
					let endDateMonth = ((endDateNew.getMonth()+1)<10)?'0'+(endDateNew.getMonth()+1):(endDateNew.getMonth()+1);
					let endDateDate = (endDateNew.getDate()<10)?'0'+endDateNew.getDate():endDateNew.getDate();
					let endDateHours = (endDateNew.getHours()<10)?'0'+endDateNew.getHours():endDateNew.getHours();
					let endDateMinutes = (endDateNew.getMinutes()<10)?'0'+endDateNew.getMinutes():endDateNew.getMinutes();
					let endDateTime = endDateHours+':'+endDateMinutes+':00'
					let endDate = endDateYear+'-'+endDateMonth+'-'+endDateDate+'T'+endDateTime;
					let calendarObj = {
						"summary": booking.tripName+ ' Flight Arrival Date Time',
						"description": booking.tripName+" for "+ booking.groupName,
						"start": {
				            "dateTime": startDate,
				            "timeZone": "Asia/Kathmandu"
				        },
				        "end": {
				            "dateTime": endDate,
				            "timeZone": "Asia/Kathmandu"
				        }
					};
					let appCalendarLib = new AppCalendarLib();
					appCalendarLib.saveToCalendar(req.headers.email, calendarObj)
						.then(googleCalendarObj=>{
							if(JSON.stringify(googleCalendarObj) !== "{}"){
								resolve(googleCalendarObj.id)
							}else{
								resolve('');
							}
						});
				}); 
				Promise.all([syncDeparture, syncArrival]).then(calendarIds => { 
					req.body.flightDepartureCalendarId = calendarIds[0];
					req.body.flightArrivalCalendarId = calendarIds[1];
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