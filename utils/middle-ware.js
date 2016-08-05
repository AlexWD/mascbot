'use strict';
let bodyParser = require('body-parser');

module.exports = function(server, express) {

	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({extended: true}));
};