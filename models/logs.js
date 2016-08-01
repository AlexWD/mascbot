'use strict';

const db = require('../db');

const modelName = 'Log';

let Model = db.sequelize.define(modelName, {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	request: {
		type: db.Sequelize.TEXT,
		allowNull: true,
	},

	reply: {
		type: db.Sequelize.TEXT,
		allowNull: true,
	},

}, {
	tableName: 'logs',

	instanceMethods: {

	},

	classMethods: {

	},
});

module.exports = Model;
