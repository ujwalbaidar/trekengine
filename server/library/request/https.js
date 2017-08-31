'use strict';

/********************************************************************
 * Https Library for https requests
 * Implementation of node https module
 * Use to make get, post, put and delete request
 * To make request construct must get hostname, path, method, headers
 * Prepared By: Ujwal Baidar
 **********************************************************************/

const https = require('https');
const querystring = require('querystring');

class HttpsCalls {
    constructor(args) {
        this.options = {
            hostname: args.hostname ? args.hostname : '',
            path: args.path ? args.path : '',
            headers: args.headers ? args.headers : {},
            port: args.port ? args.port : 443
        };
    }

    getRequest() {
        return new Promise((resolve, reject) => {
            let data = '';
            let req = https.request(this.options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            let dataObj = JSON.parse(data);
                            resolve(dataObj);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject({Error: `Failed to retrieve Data`});
                    }
                });
            });
            req.on('error', (e) => {
                reject(`${e.message}`);
            });
            req.end();
        });
    }

    postRequest(postdata) {
        if(this.options && this.options.headers['Content-Type']==='application/json'){
            var stringifyPostData = JSON.stringify(postdata);
            this.options.headers['Content-Length'] = Buffer.byteLength(stringifyPostData);
            this.options.method = 'POST';
        }else{
            var stringifyPostData = querystring.stringify(postdata)
            this.options.headers['Content-Length'] = querystring.stringify(postdata).length;
            this.options.method = 'POST';
        }
        return new Promise((resolve, reject) => {
            let data = '';
            let req = https.request(this.options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200 || res.statusCode === 201) {
                        try {
                            let dataObj = JSON.parse(data);
                            resolve(dataObj);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(data);
                    }
                });
            });

            req.on('error', (e) => {
                reject(`${e.message}`);
            });
            req.write(stringifyPostData);
            req.end();
        });
    }

    putRequest(updateData) {
        return new Promise((resolve, reject) => {
            let data = '';
            let req = https.request(this.options, (res) => {
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            let dataObj = JSON.parse(data);
                            resolve(dataObj);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject({
                            Error: `Failed to retrieve Data`
                        });
                    }
                });
            });

            req.on('error', (e) => {
                reject(`${e.message}`);
            });
            req.write(JSON.stringify(updateData));
            req.end();
        });
    }

    deleteRequest() {
        return new Promise((resolve, reject) => {
            let data = '';
            let req = https.request(this.options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            let dataObj = JSON.parse(data);
                            resolve(dataObj);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject({
                            Error: `Failed to retrieve Data`
                        });
                    }
                });
            });

            req.on('error', (e) => {
                reject(`${e.message}`);
            });
            req.end();
        });
    }
}

module.exports = HttpsCalls;