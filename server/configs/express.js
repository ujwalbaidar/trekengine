const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rootPath = path.normalize(__dirname + '/../../');

module.exports = function(app){
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    app.use(bodyParser.json({limit: '10mb'}));
    app.use(express.static(rootPath + '/attachments'));
    app.use(express.static(rootPath + 'trek-engine-client/dist'));
    app.set('views', [rootPath + 'trek-engine-client/dist', rootPath + 'public']);

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
}