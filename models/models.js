'use strict';

const InventoryItem = require('./inventoryItem');
const Order = require('./order');
const OrderItem = require('./orderItem');
const Runner = require('./runner.js');

// Assosiations
OrderItem.belongsTo(Order);
OrderItem.belongsTo(InventoryItem);

Order.hasMany(OrderItem);
Runner.hasMany(Order);

// Exports
module.exports.InventoryItem = InventoryItem;
module.exports.Order = Order;
module.exports.OrderItem = OrderItem;
module.exports.Runner = Runner;

module.exports.Models = [InventoryItem, Order, OrderItem, Runner];

