const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');
const User = mongoose.model('User');
const AppEmail = require('../../library/appEmail/appEmail');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const fs = require('fs');
const ejs = require('ejs');


exports.createTrips = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.departureDate = req.body.departureDate;
		req.body.arrivalDate = req.body.arrivalDate;
		req.body.createdDate = new Date();
		req.body.updatedDate = new Date();
		req.body.userId = req.headers.userId;
		req.body.userEmail = req.headers.email;
		let trips = new Trips(req.body);
		trips.save((err, trip)=>{
			if(err){
				console.log(err)
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:trip});
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
		getFilterResultQuery(departureDate, arrivalDate)
			.then(result=>{
				filterByDates(req.headers.userId, result)
				.then(trips=>{
					res.status(200).json({success:true, data:trips});
				})
				.catch(err=>{
					res.status(400).json({success:false, data:err});
				});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function filterByDates(userId, Result){
	return new Promise((resolve, reject)=>{
		Trips.aggregate([
			{ $match: { userId: userId } },
			{
				$project:{
					name:1,
              		bookingId:1,
					arrivalDate:1,
					departureDate:1,
					result: Result
          		}
			},{
				$match: {"result": true}
			},{
				$lookup:{
					from: "bookings",
					localField: "bookingId",
					foreignField: "bookingId",
					as: "bookings"
				}
			},{
				$match: {"bookings.0":{$exists:true}}
			},{
				$sort:{"departureDate.epoc":-1}
			}
   		])
   		.exec((err, response)=>{
   			if(err){
   				reject(err);
   			}else{
   				resolve(response);
   			}
   		})
	});
}

function getFilterResultQuery(departureDate, arrivalDate){
	return new Promise(resolve=>{
		let result = {
      		$or:[{
      			$and: [ { $gte: [ "$departureDate.epoc", departureDate ] }, { $lte: [ "$departureDate.epoc", arrivalDate ] } ]
        	},{
            	$and: [ { $gte: [ "$arrivalDate.epoc", departureDate ] }, { $lt: [ "$arrivalDate.epoc", arrivalDate ] } ]
        	}]
  		};
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
	})
}