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

	price: {
		type: db.Sequelize.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0.0,
	},

}, {
	tableName: 'order_items',
	instanceMethods: {

		getAmount() {
			return this.get('quantity') * this.get('price');
		},

	},
timestamps  : true,
underscored : true
});

module.exports = Model;
