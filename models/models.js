'use strict';

const InventoryItem = require('./inventoryItem');
const Order = require('./order');
const OrderItem = require('./orderItem');
const User = require('./user');
const Log = require('./logs');

// Assosiations
OrderItem.belongsTo(Order);
OrderItem.belongsTo(InventoryItem);

Log.belongsTo(User);

Order.hasMany(OrderItem);

InventoryItem.belongsToMany(InventoryItem,
	{
		as: 'Variants',
		through: 'InventoryItemsVariants',
		foreignKey: 'id',
	});
InventoryItem.belongsToMany(InventoryItem,
	{
		as: 'ComplexProducts',
		through: 'InventoryItemsComplexProducts',
		foreignKey: 'id',
	});

// Exports
module.exports.InventoryItem = InventoryItem;
module.exports.Order = Order;
module.exports.OrderItem = OrderItem;
module.exports.Log = Log;
module.exports.User = User;

module.exports.Models = [InventoryItem, Order, OrderItem, User, Log];

