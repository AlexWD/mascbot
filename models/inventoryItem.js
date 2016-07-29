'use strict';

const db = require('../db');
const Button = require('../botapi/structured_content').Button;
const GenericElement = require('../botapi/structured_content').GenericElement;

let Model = db.sequelize.define('InventoryItem', {

	id: {
		type: db.Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	title: {
		type: db.Sequelize.STRING,
		allowNull: false,
	},

	description: {
		type: db.Sequelize.TEXT,
		allowNull: false,
		defaultValue: ''
	},

	price: {
		type: db.Sequelize.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0.0
	},

	quantity: {
		type: db.Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	image: {
		type: db.Sequelize.TEXT,
		allowNull: false,
	},

	type: {
		type: db.Sequelize.ENUM('PRODUCT', 'VARIANT', 'COMPLEX'),
	},

}, {
	tableName: 'inventory_order_items',
	indexes: [
		{
			name: 'index_inventory_order_items_on_price',
			unique: false,
			method: 'BTREE',
			fields: ['price'],
		},
		{
			name: 'index_inventory_order_items_on_quantity',
			unique: false,
			method: 'BTREE',
			fields: ['quantity'],
		},
		{
			name: 'index_inventory_order_items_on_title',
			unique: false,
			method: 'BTREE',
			fields: ['title'],
		},
	],

	instanceMethods: {

		getStructuredObject() {

			return new GenericElement({
				title: this.get('title'),
				item_url: "",
				image_url: this.get('image'),
				subtitle: this.get('description')
			})
				.addButton(
					new Button({
						action: this.get('id'),
						title: `Buy ${this.get('price')}$`,
						type: Button.POSTBACK,
					})
				)

		},

	},

	classMethods: {

		type: {
			PRODUCT: 'PRODUCT',
			VARIANT: 'VARIANT',
			COMPLEX: 'COMPLEX',
		},

		getItems() {
			return new Promise((resolve, reject) => {
				Model.findAll({})
					.then(resolve)
					.catch(error => {
						logger.error('PostgreSQL: ' + error.message, error);
						reject(error);
					});
			});
		},

		getPage(startId, pageSize) {
			return new Promise((resolve, reject) => {
				Model.findAll({
					where: {
						id: {
							$gt: startId,
						}

					},
					limit: pageSize,
					order: 'id',
				})
					.then(resolve)
					.catch(error => {
						logger.error('PostgreSQL: ' + error.message, error);
						reject(error);
					});
			})
		}

	},
});

module.exports = Model;
