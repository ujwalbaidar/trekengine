const mongoose = require('mongoose');
const Packages = mongoose.model('Packages');

exports.createPackage = function(req, res) {
	if(req.headers && req.headers.userId && req.headers.role==10){
		req.body.userId = req.headers.userId;
		let packages = new Packages(req.body);
		packages.save((err, package)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:package});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.getPackage = function(req, res) {
	if(req.headers && req.headers.userId && req.headers.role==10){
		PackageQuery({userId:req.headers.userId})
			.then(packages=>{
				res.status(200).json({success:true, data:packages});
			})
			.catch(packageErr=>{
				res.status(400).json({success:false, data:packageErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

function PackageQuery(query){
	return new Promise((resolve, reject)=>{
		Packages.find(query,(err, packages)=>{
			if(err){
				reject(err);
			}else{
				resolve(packages);
			}
		});
	})
}

exports.getPackageByQuery = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role==10){
		let query = Object.assign(req.query, {userId:req.headers.userId});
		PackageQuery(query)
			.then(packages=>{
				res.status(200).json({success:true, data:packages});
			})
			.catch(packageErr=>{
				res.status(400).json({success:false, data:packageErr});
			});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.updatePackage = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role==10){
		let updateData = {
			name: req.body.name,
			description: req.body.description,
			cost: req.body.cost,
			annualCost: req.body.annualCost,
			days: req.body.days,
			trialPeriod: req.body.trialPeriod,
			priorityLevel: req.body.priorityLevel,
			featureIds: req.body.featureIds,
			updateDate: new Date(),
			status: req.body.status
		};
		Packages.update({_id: req.body._id, userId: req.headers.userId}, updateData, (err, package)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:package});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}

exports.deletePackage = function(req, res){
	if(req.headers && req.headers.userId && req.headers.role==10){
		Packages.remove({ _id:req.headers.deleteid, userId: req.headers.userId }, (err, package)=>{
			if(err){
				res.status(400).json({success:false, data:err});
			}else{
				res.status(200).json({success:true, data:package});
			}
		});
	}else{
		res.status(401).json({success:false, message: 'Login is Required!'});
	}
}