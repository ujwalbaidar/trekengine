const mongoose = require('mongoose');
const Trips = mongoose.model('Trips');

exports.createTrips = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.departureDate = req.body.departureDate;
		req.body.arrivalDate = req.body.arrivalDate;
		req.body.createdDate = new Date();
		req.body.updatedDate = new Date();
		req.body.userId = req.headers.userId;
		let trips = new Trips(req.body);
		trips.save((err, trip)=>{
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
		console.log(req.body);
		let updateData = {
			name: req.body.name,
			departureDate: req.body.departureDate,
			arrivalDate: req.body.arrivalDate,
			guideId: req.body.guideId,
			status: req.body.status,
			updateDate: new Date()
		};
		Trips.update({_id: req.body._id, userId: req.headers.userId, bookingId: req.body.bookingId}, updateData, {upsert: true}, (err, tripUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:tripUpdate});
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