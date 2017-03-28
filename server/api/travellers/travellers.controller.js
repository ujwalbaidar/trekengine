const mongoose = require('mongoose');
const Travelers = mongoose.model('Travelers');
const fs = require('fs');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../../../server/configs/config')[env];
const User = mongoose.model('User');
const Bookings = mongoose.model('Bookings');

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
						req.body.dob=getIsoDateToString(req.body.dob);
						if(req.body.airportPickup && req.body.airportPickup.confirmation && req.body.airportPickup.date){
							req.body.airportPickup.date=getIsoDateToString(req.body.airportPickup.date);
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
				let profileAttachment = dataObj.profileAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				if(dataObj.imageAttachments && dataObj.imageAttachments.profile){
					if(dataObj.imageAttachments && dataObj.imageAttachments.insurance){
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
				resolve({profileAttachment:""});
			}
		});
		let savePassportAttachments = new Promise((resolve, reject)=>{
			if(dataObj.passportAttachment && (dataObj.passportAttachment.name!==undefined)){
				let passportAttachment = dataObj.passportAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
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
				resolve({passportAttachment:""});
			}
		});

		let insuranceAttachment = new Promise((resolve, reject)=>{
			if(dataObj.insuranceAttachment && (dataObj.insuranceAttachment.name!==undefined)){
				let insuranceAttachment = dataObj.insuranceAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
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
				resolve({insuranceAttachment:""});
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
				fs.unlink(pathArr[i], (err) => {
					if (err) {
						reject(err);
					}
					if(i == (pathArr.length-1)){
						resolve();
					}
				});
			}
		}else{
			resolve();
		}
	});
}

exports.updateTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		saveAttachments(req.body, 'update')
			.then(attachments=>{
				let updateData = {
					firstName: req.body.firstName,
					middleName: req.body.middleName,
					lastName: req.body.lastName,
					nationality: req.body.nationality,
					permanentAddress: req.body.permanentAddress,
					email: req.body.email,
					dob: getIsoDateToString(req.body.dob),
					telephone: req.body.telephone,
					airportPickup: req.body.airportPickup,
					emergencyContact: { 
						name: req.body.emergencyContactName, 
						number: req.body.emergencyContactNumber, 
						relation: req.body.emergencyContactRelation
					},
					messagebox: req.body.messageBox,
					status: req.body.status,
					updatedDate: new Date(),
					hotel: req.body.hotel,
					attachments: req.body.attachments,
					selected: req.body.selected
				};

				if(req.body.airportPickup && req.body.airportPickup.confirmation && req.body.airportPickup.date){
					updateData.airportPickup.date = getIsoDateToString(req.body.airportPickup.date);
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
				if(req.body.bookingId){
					updateData.bookingId = req.body.bookingId;
				}
				Travelers.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, travelerUpdate)=>{
					if(err){
						res.status(400).json({success:false, data:err});
					}else{
						if(req.body.bookingId){
							updateBooking({bookingId: req.body.bookingId},{$addToSet:{travellers:req.body._id}})
								.then(updateBookingData=>{
									res.status(200).json({success:true, data:travelerUpdate});
								})
								.catch(updateErr=>{
									res.status(400).json({success:false, data:updateErr});
								})
						}else{
							res.status(200).json({success:true, data:travelerUpdate});
						}
					}
				});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
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
			User.findOne({domain:origin},(err, user)=>{
				if(err){
					reject(err);
				}else{
					if(user && user._id){
						resolve({success: true, msg: '', data: user._id});
					}else{
						resolve({success:false, msg: `${origin} is not registered!`});
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
		saveAttachments(req.body, 'save')
			.then(saveRes=>{
				req.body.userId = req.headers.userId;
				req.body.attachments = {};
				if(req.body.dob){
					req.body.dob=getIsoDateToString(req.body.dob);
				}else{
					req.body.dob = '';
				}

				if(req.body.airportPickup && req.body.airportPickup.confirmation && req.body.airportPickup.date){
					req.body.airportPickup.date=getIsoDateToString(req.body.airportPickup.date);
				}else{
					req.body.airportPickup = {};
				}

				if(req.body.hotel && req.body.hotel.confirmation==false){
					req.body.hotel = {};
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
				req.body.selected = true;
				let travelers = new Travelers(req.body);
				travelers.save((err, traveler)=>{
					if(err){
						res.status(400).json({success:false, data:err});
					}else{
						updateBooking({bookingId: traveler.bookingId},{$addToSet:{travellers:traveler._id}})
							.then(updateBookingData=>{
								res.status(200).json({success:true, data:traveler});
							})
							.catch(updateErr=>{
								res.status(400).json({success:false, data:updateErr});
							});
					}
				});
			})
			.catch(saveErr=>{
				res.status(400).send({message:"Failed to save all attachments", error: JSON.stringify(saveErr)});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}