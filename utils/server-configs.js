'use strict';

module.exports = function(server) {
	// set view engine
	server.set('view engine', 'ejs');

	// set port
	server.set('port', process.env.PORT || 3000);
};
