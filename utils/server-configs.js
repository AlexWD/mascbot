'use strict';

module.exports = function(app) {
	// set view engine
	app.set('view engine', 'ejs');

	// set port
	app.set('port', process.env.PORT || 3000);
};
