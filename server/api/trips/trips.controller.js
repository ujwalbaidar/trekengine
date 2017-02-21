const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');

exports.createTrips = function(req, res) {
	req.body.departureDate = req.body.departureDate.epoc;
	req.body.arrivalDate = req.body.arrivalDate.epoc;
	req.body.guideId = req.body.guide;
	let trips = new Trips(req.body);
	trips.save((err, trip)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:trip});
		}
	});
}

exports.getAllTrips = function(req, res) {
	Trips.find((err, trips)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:trips});
		}
	});
}

exports.updateTrips = function(req, res){
	let updateQuery = req.query;
	let updateData = req.body;
	Trips.update(req.query, updateData, {upsert: true}, (err, tripUpdate)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:tripUpdate});
		}
	});
}

exports.deleteTrips = function(req, res){
	Trip.remove(req.params.tripId, (err, trip)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:trip});
		}
	});
}