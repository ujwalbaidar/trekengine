const mongoose = require('mongoose');
const Flights = mongoose.model('Flights');

exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.bookingId = req.body.bookingId;
		console.log(req.body);
		let flights = new Flights(req.body);
		flights.save((err, trip)=>{
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
		console.log(req.body.bookingId)
		let updateData = {
			// flightType: req.body.flightType,
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