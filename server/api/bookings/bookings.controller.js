const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');
const Travelers = mongoose.model('Travelers');

exports.getAllBooking = function(req,res){
	if(req.headers && req.headers.userId){
		Bookings.find({userId: req.headers.userId }, (err, bookings)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:bookings});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.getBooking = function(req, res){
	if(req.headers && req.headers.userId){
		getByBookingQuery(req.query)
			.then(booking=>{
				res.status(200).json({success: true, data: booking});
			})
			.catch(bookingErr=>{
				res.status(400).json({success: false, data: bookingErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.createBooking = function(req,res){
	if(req.headers && req.headers.userId && req.headers.remainingDays>=1){
		req.body.userId = req.headers.userId;
		req.body.tripId = req.body.trip;
		req.body.totalCost = req.body.travellerCount*req.body.tripCost;
		req.body.dueAmount = (req.body.travellerCount*req.body.tripCost)-req.body.advancePaid;
		let bookings = new Bookings(req.body);
		bookings.save((err, bookings)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:bookings});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.updateBooking = function(req,res){
	if(req.headers && req.headers.userId){
		let updateData = {
			groupName: req.body.groupName,
			tripId: req.body.trip,
			travellerCount: req.body.travellerCount,
			totalCost: req.body.travellerCount*req.body.tripCost,
			tripCost: req.body.tripCost,
			advancePaid: req.body.advancePaid,
			dueAmount: (req.body.travellerCount*req.body.tripCost)-req.body.advancePaid,
			updateDate: new Date()
		};
		if(req.body.selectedGuide){
			updateData.selectedGuide = req.body.selectedGuide;
		}
		Bookings.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, bookingUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:bookingUpdate});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.deleteBooking = function(req,res){
	if(req.headers && req.headers.userId){
		Bookings.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, bookings)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:bookings});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function getByBookingQuery(query){
	return new Promise((resolve, reject)=>{
		Bookings.findOne(query, (err, booking)=>{
			if(err){
				reject(err);
			}else{
				if(booking && booking.travellers && booking.travellers.length>0){
					findTravelersByIds(booking.travellers)
						.then(travelers=>{
							booking.travellers = travelers;
							resolve(booking);
						})
						.catch(travelerErr=>{
							reject(travelerErr);
						})
				}else{
					resolve(booking);
				}
			}
		});
	})
}

function findTravelersByIds(idArr){
	return new Promise((resolve, reject)=>{
		Travelers.find({_id:{$in:idArr}}, (err, traveler)=>{
			if(err){
				reject(err);
			}else{
				resolve(traveler);
			}
		});
	});
}

exports.removeTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		let query = {userId: req.headers.userId, bookingId: req.body.query};
		console.log(req.body)
		Bookings.update(query, {$pull:{travellers:req.body.data}}, (err, updateData)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				Travelers.update({userId: req.headers.userId, _id: req.body.data},{selected:false, bookingId:""},(travelerErr,updateTraveler)=>{
					if(travelerErr){
						res.status(400).json({success:false, data:travelerErr});
					}else{
						res.status(200).json({success:true, data:{bookingUpdate:updateData, travelerUpdate: updateTraveler}});
					}
				});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}