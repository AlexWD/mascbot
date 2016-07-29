'use strict';

let express = require('express');
let server = express();     
let router = require('./router/routes.js');
let middleWare = require('./utils/middle-ware.js');
let serverConfig = require('./utils/server-configs.js');

// MIDDLE-WARE
middleWare(server, express);

// ROUTER
router(server);

// SERVER CONFIGURATIONS
serverConfig(server);

server.listen(server.get('port'), () => {
	console.log('Listening on Port:' + server.get('port'));
})

module.exports = server;		
