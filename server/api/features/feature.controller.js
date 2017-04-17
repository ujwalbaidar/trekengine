const mongoose = require('mongoose');
const Features = mongoose.model('Features');

exports.createFeature = function(req, res) {
	if(req.headers && req.headers.userId && req.headers.role==10){
		req.body.userId = req.headers.userId;
		let features = new Features(req.body);
		features.save((err, feature)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:feature});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.getFeature = function(req, res) {
	if(req.headers && req.headers.userId && req.headers.role==10){
		featureQuery({userId:req.headers.userId})
			.then(features=>{
				res.status(200).json({success:true, data:features});
			})
			.catch(featureErr=>{
				res.status(400).json({success:false, data:featureErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function featureQuery(query){
	return new Promise((resolve, reject)=>{
		Features.find(query,(err, features)=>{
			if(err){
				reject(err);
			}else{
				resolve(features);
			}
		});
	})
}

exports.updateFeature = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role==10){
		let updateData = {
			name: req.body.name,
			description: req.body.description,
			updateDate: new Date()
		};
		Features.update({_id: req.body._id, userId: req.headers.userId}, updateData, (err, feature)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:feature});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.deleteFeature = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role==10){
		Features.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, feature)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:feature});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}