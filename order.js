'use strict';

const logger = require('./logger');
const OrderModel = require('./models/models').Order;
const OrderItem = require('./models/models').OrderItem;
const InventoryItem = require('./models/models').InventoryItem;

class Order {

	// {
	// 	seat_address: seat_address,
	// 	status: Order.NEW,
	// 	stadium: 'stadium 1',
	// 	phone: response.text,
	// 	game: 'game 1',
	// }
	constructor(obj){
		this.order = OrderModel.build(obj);
		this.items = {};
	}

	save() {
		return new Promise((resolve, reject) => {
			this.order.save().then((order) => {
				this.order = order;
				console.log('saved order', order.get('id'))
				try {
					// console.log(Object.keys(this.items).map(key => {
					// 	console.log('saved order ' + key);
					// 	return {
					// 		InventoryItemId: this.items[key].inventoryItem.get('id'),
					// 		OrderId: this.order.get('id'),
					// 		quantity: this.items[key].quantity,
					// 		price: this.items[key].price
					// 	}
					// }))
					OrderItem.bulkCreate(
						Object.keys(this.items).map(key => {
							return {
								InventoryItemId: this.items[key].inventoryItem.get('id'),
								OrderId: this.order.get('id'),
								quantity: this.items[key].quantity,
								price: this.items[key].price
							}
						})
					).then(() => {
						console.log('bulkCreated')
						resolve(order);
					}).catch(reject)
				}catch (e) {
					console.log(e)
					reject(e)
				}
			}).catch(reject)
		})
	}

	setSeatAddress(seat_address) {
		this.order.set('seat_address', seat_address);
	}

	addItem(item) {
		if (this.items[item.get('id')] != null) {
			this.items[item.get('id')].quantity++;
		} else {
			this.items[item.get('id')] = {
				quantity: 1,
				price: item.get('price'),
				inventoryItem: item
			}
		}
	}

	setStatus(status) {
		this.order.set('status', status);
	}

	getOrderText() {
		let totalPrice = 0;
		let result = this.order.get('seat_address')  + ' ';
		result += Object.keys(this.items).reduce((text, key) => {
			let amount = this.items[key].quantity * this.items[key].price;
			totalPrice += amount;
			return text + `${this.items[key].inventoryItem.get('title')}  ${this.items[key].quantity} x ${this.items[key].price} = ${amount} `
		}, '')

		return result + `Total price: ${totalPrice}`;
	}


}

module.exports = Order;