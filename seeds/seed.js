var request = require('request');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('../server/configs/config')[env];

module.exports.seed = function(){
	request(config.webHost+'/api/seed/seedUser', function (error, response, body) {
		if(error){
			console.log(error)
		}else{
			console.log(body);
		}
	});
}

