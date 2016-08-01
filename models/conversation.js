'use strict';

const db = require('../db');

const modelName = 'Conversation';

let Model = db.sequelize.define(modelName, {

	id: {
		type: db.Sequelize.STRING,
		primaryKey: true,
		autoIncrement: true,
	},

}, {
	tableName: 'logs',

	instanceMethods: {

	},

	classMethods: {

	},
});

module.exports = Model;
