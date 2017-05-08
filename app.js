const express = require('express');
let app = express();

const server = require('http').createServer(app);  
const io = require('socket.io')(server);

const CronJob = require('cron').CronJob;

let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('./server/configs/config')[env];
console.log(env);
require('./server/configs/express')(app);
require('./server/configs/mongoose')(config);
require('./server/models');
require('./server/routes')(app);
require('./server/api/schedulers/packageExpire.scheduler')(io);
require('./server/api/schedulers/tripnotificaiton.scheduler')(io);
const reqSocket = require('./server/socket/socket')(io);
reqSocket.connectSocketIo();


server.listen(config.port, config.host, ()=>{
	console.log(`Server Running at: http://${config.host}:${config.port}/ on ${env} enviornment`);
});

