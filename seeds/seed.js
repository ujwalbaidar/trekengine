var request = require('request');

module.exports.seed = function(){
	request('http://localhost:5000/api/seed/seedUser', function (error, response, body) {
		if(error){
			console.log(error)
		}else{
			console.log(body);
		}
	});
}

