const express = require('express');
let app = express();

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('./server/configs/config')[env];

require('./server/configs/express')(app);
require('./server/configs/mongoose')(config);
app.listen(config.port, config.host, ()=>{
	console.log(`Server Running at: http://${config.host}:${config.port}/ on ${env} enviornment`);
});