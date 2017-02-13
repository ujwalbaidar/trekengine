module.exports = function(app){
	app.route('*')
        .get((req, res) => {
            res.render('index');
        });
}