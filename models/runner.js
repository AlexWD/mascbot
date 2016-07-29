'use strict';

const db = require('../db');

let Model = db.sequelize.define('Runners', {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	first_name: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	last_name: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	email: {
		type: db.Sequelize.STRING,
		defaultValue: ""
	},

	password: {
		type: db.Sequelize.STRING,
		defaultValue: ""
	},

	slack_id: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	section_id: {
		type: db.Sequelize.INTEGER,
		defaultValue: 0
	},
	
	team: {
		type: db.Sequelize.INTEGER,
		defaultValue: 0
	},

	slack_channel_ids: {
		type: db.Sequelize.ARRAY(db.Sequelize.STRING),
		defaultValue: []
	}

}, {
	tableName: 'runners',
});

module.exports = Model;