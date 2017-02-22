const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');

exports.createTrips = function(req, res) {
	req.body.departureDate = req.body.departureDate;
	req.body.arrivalDate = req.body.arrivalDate;
	req.body.guideId = req.body.guide;
	req.body.createdDate = new Date();
	req.body.updatedDate = new Date();
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
	let updateData = {
		name: req.body.name,
		departureDate: req.body.departureDate,
		arrivalDate: req.body.arrivalDate,
		guideId: req.body.guideId,
		status: req.body.status,
		updateDate: new Date()
	}
	Trips.update({_id: req.body._id}, updateData, {upsert: true}, (err, tripUpdate)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:tripUpdate});
		}
	});
}

exports.deleteTrips = function(req, res){
	Trips.remove({ _id:req.headers.deleteid }, (err, trip)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:trip});
		}
	});
}