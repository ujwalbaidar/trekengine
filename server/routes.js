module.exports = function(app){
	app.use('/api/users', require('./api/users'));
	app.route('*')
        .get((req, res) => {
            res.render('index');
        });
}