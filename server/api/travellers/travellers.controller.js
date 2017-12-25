const mongoose = require('mongoose');
const Travelers = mongoose.model('Travelers');
const fs = require('fs');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const User = mongoose.model('User');
const Bookings = mongoose.model('Bookings');
let AppCalendarLib = require('../users/appCalendar');
let GoogleAuthLib = require('../../library/oAuth/googleAuth');


exports.getTravelerDetails = function(req, res) {
	if(req.headers && req.headers.userId){
		Travelers.find({userId: req.headers.userId }, (err, travelers)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data: travelers});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.createTravellers = function(req, res) {
	validateIframe(req.headers)
		.then(validateResponse=>{
			if(validateResponse.success == true){
				saveAttachments(req.body, 'save')
					.then(saveRes=>{
						req.body.userId = validateResponse.data;
						req.body.attachments = {};
						if(req.body.dob){
							req.body.dob=req.body.birthDate;
						    let ageDifMs = Date.now() - (req.body.dob.epoc*1000);
						    let ageDate = new Date(ageDifMs);
						    req.body.age = Math.abs(ageDate.getUTCFullYear() - 1970);
						}
						if(req.body.airportPickup && req.body.airportPickup.confirmation && req.body.airportPickup.date){
							req.body.airportPickup.date= req.body.airportPickupDate
						}

						if(req.body.profileAttachment && req.body.profileAttachment.name){
							let profileAttachmentPath = saveRes.filter(pathObj=>{
								if(pathObj['profileAttachment']){
									return pathObj['profileAttachment'];
								}
							});
							req.body.attachments.profile = profileAttachmentPath[0].profileAttachment;
						}
						if(req.body.passportAttachment && req.body.passportAttachment.name){
							let passportAttachmentPath = saveRes.filter(pathObj=>{
								if(pathObj['passportAttachment']){
									return pathObj['passportAttachment'];
								}
							});
							req.body.attachments.passport = passportAttachmentPath[0].passportAttachment;
						}
						if(req.body.insuranceAttachment && req.body.insuranceAttachment.name){
							let insuranceAttachmentPath = saveRes.filter(pathObj=>{
								if(pathObj['insuranceAttachment']){
									return pathObj['insuranceAttachment'];
								}
							});
							req.body.attachments.insurance = insuranceAttachmentPath[0].insuranceAttachment;
						}

						req.body.travelerTripCost = (req.body.tripGuideCount * req.body.tripGuideDays * req.body.tripGuidePerDayCost)+
								(req.body.tripPoerterNumber * req.body.tripPoerterDays * req.body.tripPoerterPerDayCost)+
								(req.body.tripTransportationCost)+
								(req.body.tripAccomodationCost)+
								(req.body.tripFoodCost)+
								(req.body.tripPickupCost)+
								(req.body.tripPermitCost)+
								(req.body.tripFlightCost)+
								(req.body.tripHotelCost);
						let travelers = new Travelers(req.body);

						travelers.save((err, traveler)=>{
							if(err){
								res.status(400).json({success:false, data:err});
							}else{
								res.status(200).json({success:true, data:traveler});
							}
						});
					})
					.catch(saveErr=>{
						res.status(400).send({message:"Failed to save all attachments", error: JSON.stringify(saveErr)});
					});
			}else{
				res.status(200).send(validateResponse);
			}
		})
		.catch(iframeErr=>{
			res.status(400).send(err);
		});
	
}

function saveAttachments(dataObj, requestFor) {
	return new Promise((res, rej)=>{
		let profileAttachment = new Promise((resolve, reject)=>{
			if(dataObj.profileAttachment && (dataObj.profileAttachment.name!==undefined)){
				if(dataObj.profileAttachment.type == 'image/png'){
					var profileAttachment = dataObj.profileAttachment.imageFile.replace(/^data:image\/png;base64,/,"");
				}else if(dataObj.profileAttachment.type == 'image/jpeg'){
					var profileAttachment = dataObj.profileAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				}
				if(dataObj.imageAttachments && dataObj.imageAttachments.profile){
					if(dataObj.imageAttachments && dataObj.imageAttachments.profile){
						fs.stat("attachments/"+dataObj.imageAttachments.profile, (err, stat) => {
							if(!err){
								fs.unlink("attachments/"+dataObj.imageAttachments.profile, (err) => {
									if (err) {
										reject(err);
									}
								});
							}
						});
						
					}
				}
				let dateTime = new Date().getTime();
				fs.writeFile("attachments/profile_"+dateTime+"_"+dataObj.profileAttachment.name, profileAttachment, 'base64', function(err) {
					if(err){
						reject(err);
					}else{
						resolve({profileAttachment: "profile_" + dateTime+"_"+dataObj.profileAttachment.name});
					}
				});
			}else{
				if(dataObj.attachments && dataObj.attachments.profile == "" && dataObj.imageAttachments.profile){
					fs.stat("attachments/"+dataObj.imageAttachments.profile, (err, stat) => {
						if(!err){
							fs.unlink("attachments/"+dataObj.imageAttachments.profile, (err) => {
								if (err) {
									reject(err);
								}else{
									resolve({profileAttachment:""});
								}
							});
						}
					});
				}else{
					resolve({profileAttachment:""});
				}
			}
		});
		let savePassportAttachments = new Promise((resolve, reject)=>{
			if(dataObj.passportAttachment && (dataObj.passportAttachment.name!==undefined)){
				if(dataObj.passportAttachment.type == 'image/png'){
					var passportAttachment = dataObj.passportAttachment.imageFile.replace(/^data:image\/png;base64,/,"");
				}else if(dataObj.passportAttachment.type == 'image/jpeg'){
					var passportAttachment = dataObj.passportAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				}

				if(dataObj.imageAttachments && dataObj.imageAttachments.passport){
					fs.stat("attachments/"+dataObj.imageAttachments.passport, (err, stat) => {
						if(!err){
							fs.unlink("attachments/"+dataObj.imageAttachments.passport, (err) => {
								if (err) {
									reject(err);
								}
							});
						}
					});
				}
				let dateTime = new Date().getTime();
				fs.writeFile("attachments/passport_"+ dateTime+"_"+dataObj.passportAttachment.name, passportAttachment, 'base64', function(err) {
					if(err){
						reject(err);
					}else{
						resolve({passportAttachment: "passport_" + dateTime+"_"+dataObj.passportAttachment.name});
					}
				});
			}else{
				if(dataObj.attachments && dataObj.attachments.passport == "" && dataObj.imageAttachments.passport){
					fs.stat("attachments/"+dataObj.imageAttachments.passport, (err, stat) => {
						if(!err){
							fs.unlink("attachments/"+dataObj.imageAttachments.passport, (err) => {
								if (err) {
									reject(err);
								}else{
									resolve({passportAttachment:""});
								}
							});
						}
					});
				}else{
					resolve({passportAttachment:""});
				}
			}
		});

		let insuranceAttachment = new Promise((resolve, reject)=>{
			if(dataObj.insuranceAttachment && (dataObj.insuranceAttachment.name!==undefined)){
				if(dataObj.imageAttachments.type == 'image/png'){
					var insuranceAttachment = dataObj.insuranceAttachment.imageFile.replace(/^data:image\/png;base64,/,"");
				}else if(dataObj.imageAttachments.type == 'image/jpeg'){
					var insuranceAttachment = dataObj.insuranceAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				}
				if(dataObj.imageAttachments && dataObj.imageAttachments.insurance){
					fs.stat("attachments/"+dataObj.imageAttachments.insurance, (err, stat) => {
						if(!err){
							fs.unlink("attachments/"+dataObj.imageAttachments.insurance, (err) => {
								if (err) {
									reject(err);
								}
							});
						}
					});
					
				}
				let dateTime = new Date().getTime();
				fs.writeFile("attachments/insurance_" + dateTime+"_"+dataObj.insuranceAttachment.name, insuranceAttachment, 'base64', function(err) {
					if(err){
						reject(err);
					}else{
						resolve({insuranceAttachment: "insurance_" + dateTime+"_"+dataObj.insuranceAttachment.name});
					}
				});
			}else{
				if(dataObj.attachments && dataObj.attachments.insurance == "" && dataObj.imageAttachments.insurance){
					fs.stat("attachments/"+dataObj.imageAttachments.insurance, (err, stat) => {
						if(!err){
							fs.unlink("attachments/"+dataObj.imageAttachments.insurance, (err) => {
								if (err) {
									reject(err);
								}else{
									resolve({insuranceAttachment:""});
								}
							});
						}
					});
				}else{
					resolve({insuranceAttachment:""});
				}
			}
		});

		

		Promise.all([savePassportAttachments, profileAttachment, insuranceAttachment])
			.then(values => {
				res(values);
			})
			.catch(reason=>{
				rej(reason);
			});
	});
}

function getIsoDateToString(isoDate){
	let date = new Date(isoDate);
	let year = date.getFullYear();
	let month = date.getMonth()+1;
	let dt = date.getDate();

	if (dt < 10) {
		dt = '0' + dt;
	}
	
	if (month < 10) {
		month = '0' + month;
	}
	let stringDate = year+'-' + month + '-'+dt;
	return stringDate;
}

exports.deleteTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		Travelers.findOne({ _id:req.headers.deleteid, userId: req.headers.userId }, {attachments:1, _id:0}, (err, travelerInfo) => {
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				let filePathArr = [];
				if(travelerInfo.attachments && travelerInfo.attachments.profile){
					filePathArr.push("attachments/"+travelerInfo.attachments.profile);
				}
				if(travelerInfo.attachments && travelerInfo.attachments.insurance){
					filePathArr.push("attachments/"+travelerInfo.attachments.insurance);
				}
				if(travelerInfo.attachments && travelerInfo.attachments.passport){
					filePathArr.push("attachments/"+travelerInfo.attachments.passport);
				}

				removeAttachments(filePathArr).then(()=>{
					Travelers.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (removeErr, traveler)=>{
						if(err){
							res.status(400).json({success:false, data:removeErr});
						}else{
							res.status(200).json({success:true, data:traveler});
						}
					});
				}).catch(deletErr=>{
					res.status(400).json({success:false, data:deletErr});
				});
			}
		});
		
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function removeAttachments(pathArr) {
	return new Promise((resolve, reject)=>{
		if(pathArr.length>0){
			for(let i=0;i<pathArr.length;i++){
				fs.stat(pathArr[i], (err, stat) => {
					if(!err){
						fs.unlink(pathArr[i], (err) => {
							if (err) {
								reject(err);
							}
						});
					}
				});
				if(i == (pathArr.length-1)){
					resolve();
				}
			}
		}else{
			resolve();
		}
	});
}

function validateIframe(headerData){
	return new Promise((resolve, reject)=>{
		let origin = headerData.weborigin;
		if(origin == config.webHost){
			auth(JSON.parse(headerData.webheader)).then(userId=>{
				resolve({success: true, msg: '', data: userId});
			}).catch(err=>{
				reject(err);
			});
		}else{
			User.findOne({"domain.siteUrl":origin},(err, user)=>{
				if(err){
					reject(err);
				}else{
					if(user && user._id){
						resolve({success: true, msg: '', data: user._id});
					}else{
						resolve({success: false, msg: `${origin} is not registered!`});
					}
				}
			});
		}
	});
}

function auth(headerToken){
	return new Promise((resolve, reject)=>{
		jwt.verify(headerToken.authToken, config.loginAuth.secretKey, { algorithms: config.loginAuth.algorithm }, function(err, decoded) {
			if(err){
				reject(err);
			}else{
				resolve(decoded.userId);
			}
		});
	});
}

exports.queryTravelerDetails = function(req, res){
	if(req.headers && req.headers.userId){
		req.query.userId = req.headers.userId;
		queryTraveler(req.query)
			.then(travelers=>{
				res.status(200).json({success:true, data:travelers});

			})
			.catch(travelerErr=>{
				res.status(400).json({success:false, data:travelerErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function queryTraveler(query){
	return new Promise((resolve, reject)=>{
		Travelers.find(query, (err, traveler)=>{
			if(err){
				reject(err);
			}else{
				resolve(traveler);
			}
		});
	})
}

exports.getAirportPickupsInfo = function(req, res){
	if(req.headers && req.headers.userId){
		let date = new Date(1497204900000)/1000;
		let query = {
			"userId" : req.headers.userId, 
			"airportPickup.confirmation": true,  
			"airportPickup.date.epoc": { $gte: date }
		};
		queryTraveler(query)
			.then(travelers=>{
				res.status(200).json({success:true, data:travelers});

			})
			.catch(travelerErr=>{
				res.status(400).json({success:false, data:travelerErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function updateBooking(query, updateData){
	return new Promise((resolve, reject)=>{
		Bookings.update(query, updateData, (err, updateReq)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateReq);
			}
		});
	});
}

exports.addTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		travelerPickupCalendar(req.body, req.headers.email)
			.then(googleCalendarObj=>{
				if(googleCalendarObj.confirmation == true){
					req.body.googleCalendarObj = googleCalendarObj.calendarObjects;
					processAddTraveler(req.body, req.headers)
						.then(addResponse=>{
							res.status(200).json(addResponse);
						})
						.catch(addError=>{
							res.status(400).json(addError);
						});
				}else{
					processAddTraveler(req.body, req.headers)
						.then(addResponse=>{
							res.status(200).json(addResponse);
						})
						.catch(addError=>{
							res.status(400).json(addError);
						});
				}
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function travelerPickupCalendar(travelerData, userEmail){
	return new Promise((resolve, reject)=>{
		if(travelerData.airportPickup && travelerData.airportPickup.confirmation === true){
			let appCalendarLib = new AppCalendarLib();
			appCalendarLib.queryUserTokens(userEmail)
				.then(userToken=>{
					if(userToken.hasToken == true){
						Bookings.findOne({bookingId: travelerData.bookingId}, (bookingErr, booking)=>{
							if(bookingErr){
								res.status(400).json({success:false, data:bookingErr, message: 'Failed to get Booking Details'});
							}else{
								let airportPickupObj = travelerData.airportPickup;
								let epocStartDate = (airportPickupObj.date.epoc+(parseInt(airportPickupObj.hrTime)*60*60)+(parseInt(airportPickupObj.minTime)*60))*1000;

								appCalendarLib.getCalendarDates(epocStartDate)
									.then(calendarDates=>{
										let user = userToken.user;
										let notificationMinutes = (parseInt(user.calendarNotification.hrTime)>0)? parseInt(user.calendarNotification.hrTime)*60+parseInt(user.calendarNotification.minTime):parseInt(user.calendarNotification.minTime);
										let calendarObj = {
											"summary": booking.tripName+' Airport Pickup',
											"description": booking.tripName+" for "+ booking.groupName,
											"start": {
									            "dateTime": calendarDates.startDateTime,
									            "timeZone": config.timezone
									        },
									        "end": {
									            "dateTime": calendarDates.endDateTime,
									            "timeZone": config.timezone
									        },
									        "reminders": {
												useDefault : false,
												overrides: [
													{'method':'email', minutes: notificationMinutes},
													{'method':'popup', minutes: notificationMinutes}
												]
											}
										};
										let accessToken = userToken.tokenObj.access_token;
										if(travelerData.googleCalendarObj && JSON.stringify(travelerData.googleCalendarObj) !== "{}"){
											let calendarId = travelerData.googleCalendarObj.organizer.email;
											let eventId = travelerData.googleCalendarObj.id;
											let googleAuthLib = new GoogleAuthLib();
											googleAuthLib.updateCalendarEvent(accessToken, calendarObj, calendarId, eventId)
												.then(googleCalendarObj=>{
													resolve({confirmation:true, calendarObjects: googleCalendarObj})
												});
										}else{
											appCalendarLib.processCalendar(accessToken, calendarObj)
												.then(googleCalendarObj=>{
													resolve({confirmation:true, calendarObjects: googleCalendarObj})
												});
										}
									});
							}
						});
					}else{
						resolve({confirmation:false, calendarObjects: {}});
					}
				});
		}else{
			resolve({confirmation:false, calendarObjects: {} });
		}
	});
}

function processAddTraveler(travelerData, headerData){
	return new Promise((resolve, reject)=>{
		saveAttachments(travelerData, 'save')
			.then(saveRes=>{
				travelerData.userId = headerData.userId;
				travelerData.attachments = {};

				if(travelerData.hotel && travelerData.hotel.confirmation==false){
					travelerData.hotel = {};
				}

				if(travelerData.profileAttachment && travelerData.profileAttachment.name){
					let profileAttachmentPath = saveRes.filter(pathObj=>{
						if(pathObj['profileAttachment']){
							return pathObj['profileAttachment'];
						}
					});
					travelerData.attachments.profile = profileAttachmentPath[0].profileAttachment;
				}
				if(travelerData.passportAttachment && travelerData.passportAttachment.name){
					let passportAttachmentPath = saveRes.filter(pathObj=>{
						if(pathObj['passportAttachment']){
							return pathObj['passportAttachment'];
						}
					});
					travelerData.attachments.passport = passportAttachmentPath[0].passportAttachment;
				}
				if(travelerData.insuranceAttachment && travelerData.insuranceAttachment.name){
					let insuranceAttachmentPath = saveRes.filter(pathObj=>{
						if(pathObj['insuranceAttachment']){
							return pathObj['insuranceAttachment'];
						}
					});
					travelerData.attachments.insurance = insuranceAttachmentPath[0].insuranceAttachment;
				}
				travelerData.selected = true;
				
				if(travelerData.dob){
				    let ageDifMs = Date.now() - (travelerData.dob.epoc*1000);
				    let ageDate = new Date(ageDifMs);
				    travelerData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
				}

				travelerData.travelerTripCost = (travelerData.tripGuideCount * travelerData.tripGuideDays * travelerData.tripGuidePerDayCost)+
								(travelerData.tripPoerterNumber * travelerData.tripPoerterDays * travelerData.tripPoerterPerDayCost)+
								(travelerData.tripTransportationCost)+
								(travelerData.tripAccomodationCost)+
								(travelerData.tripFoodCost)+
								(travelerData.tripPickupCost)+
								(travelerData.tripPermitCost)+
								(travelerData.tripFlightCost)+
								(travelerData.tripHotelCost);

				let travelers = new Travelers(travelerData);

				travelers.save((err, traveler)=>{
					if(err){
						reject({success:false, data:err});
					}else{
						updateBooking({bookingId: traveler.bookingId},{$addToSet:{travellers:traveler._id.toString()}})
							.then(updateBookingData=>{
								resolve({success:true, data:traveler});
							})
							.catch(updateErr=>{
								reject({success:false, data:updateErr});
							});
					}
				});
			})
			.catch(saveErr=>{
				reject({message:"Failed to save all attachments", data: JSON.stringify(saveErr)});
			});
	});
}

exports.updateTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		travelerPickupCalendar(req.body, req.headers.email)
			.then(googleCalendarObj=>{
				if(googleCalendarObj.confirmation == true){
					req.body.googleCalendarObj = googleCalendarObj.calendarObjects;
					processUpdataTraveler(req.body, req.headers)
						.then(addResponse=>{
							res.status(200).json(addResponse);
						})
						.catch(addError=>{
							res.status(400).json(addError);
						});
				}else{
					processUpdataTraveler(req.body, req.headers)
						.then(addResponse=>{
							res.status(200).json(addResponse);
						})
						.catch(addError=>{
							res.status(400).json(addError);
						});
				}
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function processUpdataTraveler(travelerData, headerData){
	return new Promise((resolve, reject)=>{
		saveAttachments(travelerData, 'update')
			.then(attachments=>{
				let updateData = {
					firstName: travelerData.firstName,
					middleName: travelerData.middleName,
					lastName: travelerData.lastName,
					nationality: travelerData.nationality,
					permanentAddress: travelerData.permanentAddress,
					email: travelerData.email,
					gender: travelerData.gender,
					telephone: travelerData.telephone,
					airportPickup: travelerData.airportPickup,
					messageBox: travelerData.messageBox,
					status: travelerData.status,
					updatedDate: new Date(),
					hotel: travelerData.hotel,
					attachments: travelerData.attachments,
					selected: travelerData.selected,
				};
				if(travelerData.emergencyContact){
					updateData.emergencyContact = travelerData.emergencyContact;
				}
				if(travelerData.airportPickup && travelerData.airportPickup.confirmation && travelerData.airportPickup.date){
					updateData.airportPickup.hrTime = travelerData.airportPickup.hrTime;
					updateData.airportPickup.minTime = travelerData.airportPickup.minTime;
					updateData.airportPickup.date = travelerData.airportPickup.date;
				}
				if(attachments.length>0 && attachments[0]['passportAttachment']){
					updateData['attachments']['passport'] = attachments[0]['passportAttachment'];
				}
				if(attachments.length>0 && attachments[2]['insuranceAttachment']){

					updateData['attachments']['insurance'] = attachments[2]['insuranceAttachment'];
				}
				if(attachments.length>0 && attachments[1]['profileAttachment']){
					updateData['attachments']['profile'] = attachments[1]['profileAttachment'];
				}
				if(travelerData.bookingId){
					updateData.bookingId = travelerData.bookingId;
				}

				if(travelerData.googleCalendarObj && JSON.stringify(travelerData.googleCalendarObj) !== "{}"){
					updateData.googleCalendarObj = travelerData.googleCalendarObj;
				}

				if(travelerData.dob){
					updateData.dob= travelerData.dob;
				    let ageDifMs = Date.now() - (updateData.dob.epoc*1000);
				    let ageDate = new Date(ageDifMs);
				    updateData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
				}

				updateData.travelerTripCost = (travelerData.tripGuideCount * travelerData.tripGuideDays * travelerData.tripGuidePerDayCost)+
								(travelerData.tripPoerterNumber * travelerData.tripPoerterDays * travelerData.tripPoerterPerDayCost)+
								(travelerData.tripTransportationCost)+
								(travelerData.tripAccomodationCost)+
								(travelerData.tripFoodCost)+
								(travelerData.tripPickupCost)+
								(travelerData.tripPermitCost)+
								(travelerData.tripFlightCost)+
								(travelerData.tripHotelCost);
				
				Travelers.update({_id: travelerData._id, userId: headerData.userId}, updateData, (err, travelerUpdate)=>{
					if(err){
						res.status(400).json({success:false, data:err});
					}else{
						if(travelerData.bookingId){
							updateBooking({bookingId: travelerData.bookingId},{$addToSet:{travellers:travelerData._id}})
								.then(updateBookingData=>{
									resolve({success:true, data:updateData});
								})
								.catch(updateErr=>{
									reject({success:false, data:updateErr});
								});
						}else{
							resolve({success:true, data:updateData});
						}
					}
				});
			});
	});
}

exports.getCountryList = function(req, res){
	let countries = fs.readFileSync('server/static-data/countries.json', 'utf-8');
	res.status(200).json({data:{success: true, countries: countries, message: 'All countries retrieved successfully!'}});
}