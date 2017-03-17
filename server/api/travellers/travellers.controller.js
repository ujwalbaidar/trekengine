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
			req.body.userId = '58aeae6a5c2cf04ab738ba5c';
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
}

function saveAttachments(dataObj) {

	return new Promise((res, rej)=>{
		let savePassportAttachments = new Promise((resolve, reject)=>{
			if(dataObj.passportAttachment && (dataObj.passportAttachment.name!==undefined)){
				let passportAttachment = dataObj.passportAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
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

		let profileAttachment = new Promise((resolve, reject)=>{
			if(dataObj.profileAttachment && (dataObj.profileAttachment.name!==undefined)){
				let profileAttachment = dataObj.profileAttachment.imageFile.replace(/^data:image\/jpeg;base64,/,"");
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

		Promise.all([savePassportAttachments, profileAttachment, insuranceAttachment])
			.then(values => {
				res(values)
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

exports.updateTraveler = function(req, res){
	if(req.headers && req.headers.userId){
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
				emergencyContact: req.body.emergencyContact,
				messagebox: req.body.messageBox,
				status: req.body.status,
				updatedDate: new Date(),
				hotel: req.body.hotel,
				attachments: req.body.attachments
			};

		if(req.body.airportPickup && req.body.airportPickup.confirmation && req.body.airportPickup.date){
			updateData.airportPickup.date = getIsoDateToString(req.body.airportPickup.date);
		}
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