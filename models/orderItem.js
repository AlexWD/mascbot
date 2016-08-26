'use strict';

const db = require('../db');
const InventoryItem = require('./inventoryItem');
const Order = require('./order');

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
	
	order_id: {
	 type: db.Sequelize.INTEGER, 
	 references: { model: 'Order', key: 'id' },
	},


	inventory_order_item_id: {
	 type: db.Sequelize.INTEGER, 
	 references: { model: 'InventoryItem', key: 'id' },
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
