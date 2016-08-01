'use strict';

const Sequelize = require('sequelize');
const config = require('./config');
const logger = require('./logger');

// ORM connection settings
const sequelize = new Sequelize(process.env.DATABASE_URL || config.database.url, {
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci',
	},
});

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
