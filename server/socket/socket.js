const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../configs/config')[env];
const PackageBillings = mongoose.model('PackageBillings');

module.exports = function(io){
	let module = {};
	
	module.connectSocketIo = function(){
		io.on('connection', (socket) => {
			socket.on('disconnect', function(){
				console.log('Socket disconnected');
			});
			socket.on('user-cookie', (message) => {
				if(message){
					decodeData(message).then(billingData=>{
						io.to(socket.id).emit('updateRemainingDays', billingData);
					});
				}
			});
		});
	}
	module.readSocketIo = function(){
		io.emit('transfer-cookie', '');
	}

	function decodeData(token){
		return new Promise(resolve=>{
			jwt.verify(token, config.loginAuth.secretKey, { algorithms: config.loginAuth.algorithm }, function(err, decoded) {
				if(err){
					console.log(err);
				}else{
					if(decoded.role == 20){
						PackageBillings.findOne({userId:decoded.userId, status: true, onHold: false}, (billingErr, billingResponse)=>{
							if(err){
								console.log(billingErr)
							}else{
								if(billingResponse){
									resolve({remainingDays: billingResponse.remainingDays, packageType: billingResponse.packageType});
								}else{
									resolve({remainingDays: 0, packageType: 'Basic'});
								}
							}
						});
					}
				}
			});
		});
	}
	return module;
}