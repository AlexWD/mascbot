'use strict';

const InventoryItem = require('./inventoryItem');
const Order = require('./order');
const OrderItem = require('./orderItem');

// Assosiations
OrderItem.belongsTo(Order);
OrderItem.belongsTo(InventoryItem);

Order.hasMany(OrderItem);

// Exports
module.exports.InventoryItem = InventoryItem;
module.exports.Order = Order;
module.exports.OrderItem = OrderItem;

module.exports.Models = [InventoryItem, Order, OrderItem];