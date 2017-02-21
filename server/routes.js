const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function(app){
	app.use('/api/users', require('./api/users'));
	app.use('/api/seed', require('./api/users'));
	app.use('/api/movements/trips', require('./api/trips'));

	app.route('*')
        .get((req, res) => {
            res.render('index');
        });
}
