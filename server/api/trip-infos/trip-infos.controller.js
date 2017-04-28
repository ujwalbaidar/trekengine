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