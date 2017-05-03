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
		let updateData = {
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