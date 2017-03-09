const mongoose = require('mongoose');
const Flights = mongoose.model('Flights');

exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.departure = {
				name: req.body.departure.name,
				dateTime: req.body.departure.date,
				cost: req.body.departure.cost
		};
		req.body.arrival = {
				name: req.body.arrival.name,
				dateTime: req.body.arrival.date,
				cost: req.body.arrival.cost
		};
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

exports.updateFlights = function(req, res){
	if(req.headers && req.headers.userId){
		let updateData = {
			flightType: req.body.flightType,
			departure: {
				name: req.body.departure.name,
				dateTime: req.body.departure.date,
				cost: req.body.departure.cost
			},
			arrival: {
				name: req.body.arrival.name,
				dateTime: req.body.arrival.date,
				cost: req.body.arrival.cost
			}
		};
		Flights.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, flightUpdate)=>{
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