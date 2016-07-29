'use strict';
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let passport = require('passport');

module.exports = function(server, express) {
	server.use(session({
	  secret: 'dont slack off',
	  resave: true,
	  saveUninitialized: false
	}));
	server.use(passport.initialize());
	server.use(passport.session());

	server.use(bodyParser.json());
	server.use(bodyParser.urlencoded({extended: false}));
	server.use(cookieParser());
};