'use strict';

module.exports = function(server) {

	// set port
	server.set('port', process.env.PORT || 3000);
};
