const mongoose = require('mongoose');
const Travelers = mongoose.model('Travelers');
const fs = require('fs');

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
	saveAttachments(req.body)
		.then(saveRes=>{
			let saveObj = {
				userId: '58aeae6a5c2cf04ab738ba5c',
				firstName: req.body.firstName?req.body.firstName:'',
				lastName: req.body.lastName?req.body.lastName:'',
				nationality: req.body.nationality?req.body.nationality:'',
				attachments: {},
				permanentAddress: req.body.permanentAddress?req.body.permanentAddress:'',
				email: req.body.email?req.body.email:'',
				dob: req.body.dob?req.body.dob:'',
				telephone: req.body.telephone?req.body.telephone:''
			};
			if(req.body.passportAttachment && req.body.passportAttachment.name){
				let passportAttachmentPath = saveRes.filter(pathObj=>{
					if(pathObj['passportAttachment']){
						return pathObj['passportAttachment'];
					}
				});
				saveObj.attachments.passport = passportAttachmentPath[0].passportAttachment;
			}
			if(req.body.insuranceAttachment && req.body.insuranceAttachment.name){
				let insuranceAttachmentPath = saveRes.filter(pathObj=>{
					if(pathObj['insuranceAttachment']){
						return pathObj['insuranceAttachment'];
					}
				});
				saveObj.attachments.insurance = insuranceAttachmentPath[0].insuranceAttachment;
			}

			let travelers = new Travelers(saveObj);

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
}

function saveAttachments(dataObj) {
	return new Promise((res, rej)=>{
		let currentDateTime = new Date().getTime();

		let savePassportAttachments = new Promise((resolve, reject)=>{
			if(dataObj.passportAttachment && dataObj.passportAttachment.name){
				let passportAttachment = dataObj.passportAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				fs.writeFile("attachments/"+currentDateTime+"_"+dataObj.passportAttachment.name, passportAttachment, 'base64', function(err) {
					if(err){
						reject(err);
					}else{
						resolve({passportAttachment: "attachments/"+currentDateTime+"_"+dataObj.passportAttachment.name});
					}
				});
			}else{
				resolve({passportAttachment:""});
			}
		});

		let insuranceAttachment = new Promise((resolve, reject)=>{
			if(dataObj.insuranceAttachment && dataObj.insuranceAttachment.name){
				let insuranceAttachment = dataObj.insuranceAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
				fs.writeFile("attachments/"+currentDateTime+"_"+dataObj.insuranceAttachment.name, insuranceAttachment, 'base64', function(err) {
					if(err){
						reject(err);
					}else{
						resolve({insuranceAttachment: "attachments/"+currentDateTime+"_"+dataObj.insuranceAttachment.name});
					}
				});
			}else{
				resolve({insuranceAttachment:""});
			}
		});

		Promise.all([savePassportAttachments, insuranceAttachment])
			.then(values => {
				res(values)
			})
			.catch(reason=>{
				rej(reason);
			});
	});
}

exports.deleteTraveler = function(req, res){
	if(req.headers && req.headers.userId){
		Travelers.findOne({ _id:req.headers.deleteid, userId: req.headers.userId }, {attachments:1, _id:0}, (err, travelerInfo) => {
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				let filePathArr = [];
				if(travelerInfo.attachments && travelerInfo.attachments.insurance){
					filePathArr.push(travelerInfo.attachments.insurance);
				}
				if(travelerInfo.attachments && travelerInfo.attachments.passport){
					filePathArr.push(travelerInfo.attachments.passport);
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
	});
}

exports.updateTrveler = function(req, res){
	if(req.headers && req.headers.userId){
		let updateData = {
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				nationality: req.body.nationality,
				permanentAddress: req.body.permanentAddress,
				email: req.body.email,
				dob: req.body.dob,
				telephone: req.body.telephone
			};

		Travelers.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, travelerUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:travelerUpdate});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}
/*exports.createFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		req.body.userId = req.headers.userId;
		req.body.departure = {
				name: req.body.departure.name,
				dateTime: req.body.departure.date,
				cost: req.body.departure.cost
		};
		req.body.arrival = {
				name: req.body.arrival.name,
				dateTime: req.body.arrival.date,
				cost: req.body.arrival.cost
		};
		req.body.bookingId = req.body.booking;
		let flights = new Flights(req.body);
		flights.save((err, trip)=>{
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

exports.getAllFlights = function(req, res) {
	if(req.headers && req.headers.userId){
		Flights.find({userId: req.headers.userId }, (err, trips)=>{
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

exports.getFlightsByQueryParams = function(req, res){
	if(req.headers && req.headers.userId){
		let findQuery = {userId: req.headers.userId };
		Flights.findOne(Object.assign(findQuery, req.query), (err, trips)=>{
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

exports.updateFlights = function(req, res){
	if(req.headers && req.headers.userId){
		let updateData = {
			flightType: req.body.flightType,
			departure: {
				name: req.body.departure.name,
				dateTime: req.body.departure.date,
				cost: req.body.departure.cost
			},
			arrival: {
				name: req.body.arrival.name,
				dateTime: req.body.arrival.date,
				cost: req.body.arrival.cost
			},
			bookingId: req.body.booking
		};
		Flights.update({_id: req.body._id, userId: req.headers.userId}, updateData, {upsert: true}, (err, flightUpdate)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:flightUpdate});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.deleteFlights = function(req, res){
	if(req.headers && req.headers.userId){
		Flights.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, flight)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:flight});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}*/