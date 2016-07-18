'use strict';

let Sequelize = require('sequelize');
let config = require('./config');
let logger = require('./logger');

// ORM connection settings
let sequelize = new Sequelize(process.env.DATABASE_URL || config.database.url);

/**
 * Connects to PostgreSQL showing an error if failing.
 */
exports.init = (cb) => {

	sequelize
		.authenticate()
		.then(() => {
			// logger.log("*", "PostgreSQL: db initialized.");
			// cb();
			sequelize.sync().then(() => {
				logger.info('*', 'PostgreSQL: db sync.');
				cb();
			}).catch((error) => {
				logger.error('*', 'PostgreSQL: unable to connect to the database: ' + error.message);
				cb(error);
			});
		});

};

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
