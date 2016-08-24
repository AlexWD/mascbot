'use strict';

const db = require('../db');

let Model = db.sequelize.define('OrderItems', {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	quantity: {
		type: db.Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},

}, {
	tableName: 'order_items',
	instanceMethods: {

		getQuantity() {
			return this.get('quantity');
		},

	},
timestamps  : true,
underscored : true
});

module.exports = Model;
