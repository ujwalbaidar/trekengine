const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('./configs/config')[env];

module.exports = function(app){
	app.use('/api/users', require('./api/users'));
	app.use('/api/seed', require('./api/users'));
	app.use('/api/userInfo', auth ,require('./api/users'));
	app.use('/api/authUser', superAuth ,require('./api/users'));
	app.use('/api/movements/trips', auth ,require('./api/trips'));
	app.use('/api/guides', auth, require('./api/users'));
	app.use('/api/movements/bookings',auth, require('./api/bookings'));
	app.use('/api/movements/flights',auth, require('./api/flights'));
	app.use('/api/movements/traveler', auth, require('./api/travellers'));
	app.use('/api/package-billings', auth, require('./api/package-billings'));
	app.use('/api/auth/package-billings', superAuth, require('./api/package-billings'));
	app.get('/trekengineApp/package-billings', require('./api/package-billings/package-billings.controller').getUserPackage);
	app.put('/trekengineApp/package-billings', require('./api/package-billings/package-billings.controller').updateUserPackage);
	app.use('/api/features', superAuth, require('./api/features'));
	app.use('/api/packages', superAuth, require('./api/packages'));
	app.use('/api/auth/packages', auth, require('./api/packages'));
	app.post('/trekengineApp/travellers/create', require('./api/travellers/travellers.controller').createTravellers);
	app.get('/trekengineApp/travellers/getCountryList', require('./api/travellers/travellers.controller').getCountryList);
	app.get('/trekengineApp/travellers', (req, res) => {
		res.render('iframeIndex');
	});
	app.use('/api/notifications', auth, require('./api/notifications'));
	app.use('/api/movements/tripinfos', auth, require('./api/trip-infos'));
	app.get('/trekengineApp/authorizaiton/activateUser', require('./api/users/user.controller').activateUser);
	app.get('/trekengineApp/validateAuthToken', decodeAuthToken);
	app.use('/api/analytics', auth, require('./api/analytics'));
	app.use('/api/checkouts', auth, require('./api/checkouts'));
	app.get('/trekengineApp/checkouts/success/product/:productId/user/:userId/billing/:billingType', require('./api/checkouts/checkouts.controller').submitCheckoutInfos);

	app.get('/trekengineApp/checkouts/cancel', (req, res)=>{
		res.redirect('/app/package-billings');
	});

	app.route('*')
        .get((req, res) => {
            res.render('index');
        });

    function auth(req, res, next){
		jwt.verify(req.headers.token, config.loginAuth.secretKey, { algorithms: config.loginAuth.algorithm }, function(err, decoded) {
			if(err){
				res.status(401).send({success:false, message: 'Login is Required!'});
			}else{
				if(decoded.role == 20){
					req.headers.userId = decoded.userId;
					req.headers.email = decoded.email;
					req.headers.role = decoded.role;
					req.headers.remainingDays = decoded.remainingDays?decoded.remainingDays:0;
					next();
				}else{
					req.headers.userId = decoded.userId;
					req.headers.email = decoded.email;
					req.headers.role = decoded.role;
					next();
				}
			}
		});
    }

    function superAuth(req, res, next){
    	jwt.verify(req.headers.token, config.loginAuth.secretKey, { algorithms: config.loginAuth.algorithm }, function(err, decoded) {
			if(err){
				res.status(401).send({success:false, message: 'Login is Required!'});
			}else{
				if(decoded.role === 10){
					req.headers.userId = decoded.userId;
					req.headers.email = decoded.email;
					req.headers.role = decoded.role;
					next();
				}else{
					res.status(401).send({success:false, message: 'Unauthorised User!'});
				}
			}
		});
    }

    function decodeAuthToken(req, res, next){
    	jwt.verify(req.headers.token, config.loginAuth.secretKey, { algorithms: config.loginAuth.algorithm }, function(err, decoded) {
			if(err){
				res.status(401).send({success:false, message: 'Login is Required!'});
			}else{
				let currentDate = new Date();
				let currentTime = Math.ceil(currentDate.getTime()/1000);
				if(decoded.exp>currentTime){
					let data = { 
						role: decoded.role, 
						email: decoded.email, 
						remainingDays: decoded.remainingDays, 
						packageType: decoded.packageType, 
						userName: decoded.userName
					};
					res.status(200).send({success:true, data: data });
				}else{
					res.status(401).send({success:false, message: 'Login is Required!'});
				}
			}
		});
    }
}
