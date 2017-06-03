const mongoose = require('mongoose');
const TripInfos = mongoose.model('TripInfos');

exports.findUserTripsData = function(req, res){
	if(req.headers && req.headers.userId){
		findTripsInfos({userId:req.headers.userId})
			.then(tripInfoData=>{
				res.status(200).json({success:true, data: tripInfoData});
			})
			.catch(tripInfoDataErr=>{
				res.status(400).json({success:false, data:tripInfoDataErr, message: 'Failed to retrieve trip informations.'});
			});
	}
}

exports.createTripInfos = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		let tripInfos = new TripInfos(req.body);
		tripInfos.save((err, trip)=>{
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

exports.updateTripInfos = function(req, res){
	if(req.headers && req.headers.userId){
		TripInfos.update({_id: req.body._id, userId: req.headers.userId}, {name: req.body.name, cost: req.body.cost}, (err, tripUpdate)=>{
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

exports.deleteTripInfos = function(req, res){
	if(req.headers && req.headers.userId){
		TripInfos.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, trip)=>{
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

function findTripsInfos(query){
	return new Promise((resolve, reject)=>{
		TripInfos.find(query, (err, tripInfoData)=>{
			if(err){
				reject(err);
			}else{
				resolve(tripInfoData);
			}
		});
	});
}