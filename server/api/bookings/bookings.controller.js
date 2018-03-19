const mongoose = require('mongoose');
const Bookings = mongoose.model('Bookings');
const Travelers = mongoose.model('Travelers');
const TripInfos = mongoose.model('TripInfos');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../configs/config')[env];
const AppEmail = require('../../library/appEmail/appEmail');
const fs = require('fs');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

let AppCalendarLib = require('../users/appCalendar');
let GoogleAuthLib = require('../../library/oAuth/googleAuth');

exports.getAllBooking = function(req,res){
	if(req.headers && req.headers.userId){
		let dbQuery = [
			{
				$match: {
					userId: req.headers.userId
				}
			},
			{
				$sort: {_id: -1}
			}
		];
		var aggregateQuery = Bookings.aggregate(dbQuery);
		aggregateQuery.exec((err, bookingResponse)=>{
			if(err){
				res.status(400).json({success: false, data: err, msg: 'Failed to retrieve booking data'});
			}else{
				let totalBookings = bookingResponse.length;
				let limitValue = 10;
				let skipValue = (req.query.queryPage * limitValue);
				aggregateQuery.skip(skipValue).limit(limitValue).exec((err, bookings)=>{
					if(err){
						res.status(400).json({success:false, data:err, msg: 'Failed to retrieve booking data'});
					}else{
						let totalBookingPages = Math.ceil(totalBookings/limitValue);
						res.status(200).json({success:true, data:{bookings: bookings, totalBookings: totalBookingPages}});
					}
				});
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
		let tripName = req.body.tripName.replace(/\w\S*/g, txt=>{
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		updateTripInfos({
			userId: req.headers.userId,
			name: tripName
		},{
			cost: req.body.tripCost
		})
		.then(updateTrekInf=>{
			req.body.userId = req.headers.userId;
			req.body.userEmail = req.headers.email;
			req.body.totalCost = req.body.travellerCount*req.body.tripCost;
			req.body.dueAmount = (req.body.travellerCount*req.body.tripCost)-req.body.advancePaid;
			req.body.tripName = tripName;
			req.body.tripGuideCount = 0;
			req.body.tripGuideDays = 0;
			req.body.tripGuidePerDayCost = 0;
			req.body.tripPoerterNumber = 0;
			req.body.tripPoerterDays = 0;
			req.body.tripPoerterPerDayCost = 0;
			req.body.tripTransportationCost = 0;
			req.body.tripAccomodationCost = 0;
			req.body.tripFoodCost = 0;
			req.body.tripPickupCost = 0;
			req.body.tripPermitCost = 0;
			req.body.tripFlightCost = 0;
			req.body.tripHotelCost = 0;
			req.body.tripTransportationRemarks = '';
			req.body.tripHotelRemark = '';
			req.body.tripRemark = '';
			let bookings = new Bookings(req.body);
			bookings.save((err, bookings)=>{
				if(err){
					res.status(400).json({success:false, data:err});
				}else{
					res.status(200).json({success:true, data: bookings});
				}
			});
		})
		.catch(updateErr=>{
			res.status(401).json({success:false, message: 'Failed to Create Trip Informations.'});
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.updateBooking = function(req,res){
	if(req.headers && req.headers.userId){
		let tripName = req.body.tripName.replace(/\w\S*/g, txt=>{
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
		let updateData = {
			userEmail: req.headers.email,
			groupName: req.body.groupName,
			travellerCount: req.body.travellerCount,
			totalCost: req.body.travellerCount*req.body.tripCost,
			tripCost: req.body.tripCost,
			advancePaid: req.body.advancePaid,
			dueAmount: (req.body.travellerCount*req.body.tripCost)-req.body.advancePaid,
			tripName: tripName,
			selectedGuide: req.body.selectedGuide,
			updateDate: new Date(),
			tripGuideCount: req.body.tripGuideCount || 0,
			tripGuideDays: req.body.tripGuideDays || 0,
			tripGuidePerDayCost: req.body.tripGuidePerDayCost || 0,
			tripPoerterNumber: req.body.tripPoerterNumber || 0,
			tripPoerterDays: req.body.tripPoerterDays || 0,
			tripPoerterPerDayCost: req.body.tripPoerterPerDayCost || 0,
			tripTransportationCost: req.body.tripTransportationCost || 0,
			tripAccomodationCost: req.body.tripAccomodationCost || 0,
			tripFoodCost: req.body.tripFoodCost || 0,
			tripPickupCost: req.body.tripPickupCost || 0,
			tripPermitCost: req.body.tripPermitCost || 0,
			tripFlightCost: req.body.tripFlightCost || 0,
			tripHotelCost: req.body.tripHotelCost || 0,
			tripTransportationRemarks: req.body.tripTransportationRemarks || '',
			tripHotelRemark: req.body.tripHotelRemark || '',
			tripRemark: req.body.tripRemark || ''
		};

		updateData.travelerTripCost = (req.body.tripGuideCount * req.body.tripGuideDays * req.body.tripGuidePerDayCost)+
								(req.body.tripPoerterNumber * req.body.tripPoerterDays * req.body.tripPoerterPerDayCost)+
								(req.body.tripTransportationCost)+
								(req.body.tripAccomodationCost)+
								(req.body.tripFoodCost)+
								(req.body.tripPickupCost)+
								(req.body.tripPermitCost)+
								(req.body.tripFlightCost)+
								(req.body.tripHotelCost);
		Bookings.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, bookingUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				updateTripInfos({
					userId: req.headers.userId,
					name: tripName
				},{
					cost: req.body.tripCost,
			 		updateDate: new Date()
			 	})
				.then(updateTrekInf=>{
					if(req.body.selectedGuide && (req.body.sendNotification == true)){
						let mailOptions = {
							from: config.appEmail.senderAddress,
						    to: req.body.selectedGuide, 
						    subject: 'Selected as guide for trip',
						};
						let templateString = fs.readFileSync('server/templates/selectedTripToGuide.ejs', 'utf-8');
						mailOptions.html = ejs.render(templateString, { sender: req.body.userEmail, guideName: req.body.selectedGuideName, webHost: config.webHost+'/app/bookings/booking-details/'+req.body.bookingId });
						mailOptions.text = htmlToText.fromString(mailOptions.html, {
							wordwrap: 130
						});
						
						sendEmail(mailOptions)
							.then(mailInfo=>{
								res.status(200).json({success:true, data:bookingUpdate});
							})
							.catch(err=>{
								res.status(400).json({success:false, data:err});
							});
					}else{
						res.status(200).json({success:true, data:bookingUpdate});
					}
				})
				.catch(updateErr=>{
					res.status(401).json({success:false, message: 'Failed to create Trip Informations.'});
				});
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
		removeTravelerCalendar(req.body.data, req.headers.email)
			.then(calendarDeleteResp=>{
				if(calendarDeleteResp.pickup === true){
					Bookings.update(query, {$pull:{travellers:req.body.data}}, (err, updateData)=>{
						if(err){
							res.status(400).json({success:false, data:err});
						}else{
							Travelers.update({userId: req.headers.userId, _id: req.body.data},{selected:false, bookingId:"", googleCalendarObj:{}},(travelerErr,updateTraveler)=>{
								if(travelerErr){
									res.status(400).json({success:false, data:travelerErr});
								}else{
									res.status(200).json({success:true, data:{bookingUpdate:updateData, travelerUpdate: updateTraveler}});
								}
							});
						}
					});
				}else{
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
				}
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function removeTravelerCalendar(travelerId, userEmail){
	return new Promise((resolve, reject)=>{
		Travelers.findOne({_id: travelerId}, (err, traveler)=>{
			if(err){
				reject(err);
			}else{
				if(traveler.airportPickup && traveler.airportPickup.confirmation == true){
					if(traveler.googleCalendarObj && JSON.stringify(traveler.googleCalendarObj) !== "{}"){
						let calendarObj = traveler.googleCalendarObj;
						let appCalendarLib = new AppCalendarLib();
						appCalendarLib.queryUserTokens(userEmail)
							.then(userToken=>{
								if(userToken.hasToken == true){
									let accessToken = userToken.tokenObj.access_token;
									let googleAuthLib = new GoogleAuthLib();
									googleAuthLib.deleteCalendarEvent(accessToken, calendarObj.organizer.email, calendarObj.id)
										.then(googleCalendarObj=>{
											resolve({pickup:true, calendarObjects: {}});
										});
								}else{
									resolve({pickup:false, calendarObjects: {}});
								}
							});
					}else{
						resolve({pickup:false, calendarObj: {}});
					}
				}else{
					resolve({pickup:false, calendarObj: {}});
				}
			}
		})
	})
}

function updateTripInfos(query, updateObj){
	return new Promise((resolve, reject)=>{
		TripInfos.update(query, updateObj, {upsert: true}, (err, updateResp)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateResp);
			}
		});
	});
}

function sendEmail(mailOptions){
	return new Promise((resolve, reject)=>{
		config.appEmail.mailOptions = mailOptions;
		let appEmail = new AppEmail(config.appEmail);
		appEmail.sendEmail()
			.then(emailInfo=>{
				resolve(emailInfo);
			})
			.catch(emailError=>{
				reject(emailError);
			});
	});
}