const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');

exports.createUser = function(req, res){
	req.body.firstName = req.body.fname;
	req.body.lastName = req.body.lname;
	req.body.role = req.body.role?req.body.role:20;
	req.body.createdDate = new Date();
	req.body.updatedDate = new Date();
	let user = new User(req.body);
	user.save((err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:user});
		}
	});
}

exports.findAllUser = function(req, res){
	let searchField = {};
	User.find(searchField,(err, users)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:users});
		}
	});
}

exports.fineOneUser = function(req, res){
	User.findOne(req.query, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:user});
		}
	});
}

exports.updateUser = function(req, res){
	let updateQuery = req.query;
	let updateData = req.body;
	User.update(req.query, updateData, {upsert: true}, (err, userUpdate)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:userUpdate});
		}
	});
}

exports.deleteUser = function(req, res){
	User.remove(req.params.userId, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			res.status(200).json({success:true, data:user});
		}
	});
}

exports.loginUser = function(req, res){
	User.findOne({email:req.body.email}, (err, user)=>{
		if(err){
			res.status(400).json({success:false, data:err});
		}else{
			if(user){
				if(user.password == req.body.password){
					let token = jwt.sign({email:user.email},'abcdef', { expiresIn: '1d', algorithm: 'HS256' })
					/*jwt.verify(token, 'abcdef', { algorithms: 'HS256' }, function(err, decoded) {
						if(err){
							console.log(err)
						}else{
							console.log(decoded) 
						}
					});*/
					res.status(200).json({success:true, message: "Authorised Successfully", data: {token: token}});
				}else{
					res.status(400).json({success:false, message: "Password doesn't match!", data: {errorCode:'passwordErr'}});
				}
			}else{
				res.status(400).json({success:false, message:"Email doesn't exist!", data:{errorCode:'emailErr'}});
			}
		}
	});
}