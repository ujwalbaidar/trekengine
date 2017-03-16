const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('./configs/config')[env];

module.exports = function(app){
	app.use('/api/users', require('./api/users'));
	app.use('/api/seed', require('./api/users'));
	app.use('/api/movements/trips', auth ,require('./api/trips'));
	app.use('/api/guides', auth, require('./api/users'));
	app.use('/api/movements/bookings',auth, require('./api/bookings'));
	app.use('/api/movements/flights',auth, require('./api/flights'));
	app.use('/api/movements/traveler', auth, require('./api/travellers'));
	app.post('/app/travellers/create', require('./api/travellers/travellers.controller').createTravellers);
	app.get('/app/travellers', (req, res) => {
		res.render('public/traveller-details-form.template.ejs');
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
				req.headers.userId = decoded.userId;
				next();
			}
		});
    }
}
