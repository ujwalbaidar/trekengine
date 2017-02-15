const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rootPath = path.normalize(__dirname + '/../../');

module.exports = function(app){
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(express.static(rootPath + '/client'));
    app.set('views', rootPath + 'client');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
}