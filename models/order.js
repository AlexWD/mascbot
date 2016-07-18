'use strict';

const db = require('../db');

let Model = db.sequelize.define('Order', {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	game: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	phone: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	seat_address: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

	status: {
		type: db.Sequelize.ENUM('EMPTY', 'NEW', 'FINISHED'),
		allowNull: false,
		defaultValue: 'EMPTY'
	},

	stadium: {
		type: db.Sequelize.STRING,
		allowNull: false,
		defaultValue: ""
	},

}, {
	tableName: 'orders',
	indexes: [
		{
			name: 'index_orders_on_game',
				unique: false,
			method: 'BTREE',
			fields: ['game'],
		},
		{
			name: 'index_orders_on_seat_address',
				unique: false,
			method: 'BTREE',
			fields: ['seat_address'],
		},
		{
			name: 'index_orders_on_stadium',
				unique: false,
			method: 'BTREE',
			fields: ['stadium'],
		},
	],
	instanceMethods: {

		getAmount(){
			return new Promise((resolve, reject) => {
				this.getOrderItems().then(items => {
					resolve(items.reduce((result, item) => {
						return result += item.getAmount();
					}, 0))
				}).catch(reject)
			})
		}

	},

	classMethods: {

		NEW:'NEW',
		FINISHED:'FINISHED'

	}
});

module.exports = Model;
