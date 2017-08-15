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
    app.use(express.static(rootPath + 'client/dist'));
    app.set('views', [rootPath + 'client/dist', rootPath + 'public', rootPath + 'server/templates']);
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
}