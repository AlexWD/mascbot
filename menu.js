'use strict';

const Button = require('./botapi/structured_content').Button;
const Attachment = require('./botapi/structured_content').Attachment;
const ButtonsTemplate = require('./botapi/structured_content').ButtonsTemplate;
const GenericElement = require('./botapi/structured_content').GenericElement;
const GenericTemplate = require('./botapi/structured_content').GenericTemplate;
const logger = require('./logger');
const OrderItem = require('./models/models').OrderItem;
const InventoryItem = require('./models/models').InventoryItem;
const Order = require('./order');


class Menu {

	constructor(bot, message, controller){
		this.bot = bot;
		this.message = message;
		this.controller = controller;
		this.order = new Order(
			{
				seat_address: '',
				status: Order.NEW,
				stadium: 'stadium 1',
				phone: '',
				game: 'game 1',
			}
		);
		this.convo = null;

		this.start();
	}

	start() {
		this.bot.startConversation(this.message, (err, convo) => {
			if (!err) {
				this.updateContext(convo);
				this.showMainMenu();
			} else {
				logger.error(err);
			}
		})
	}

	updateContext(convo){
		this.convo = convo;
	}

    showMainMenu(){

		InventoryItem.count().then(count => {
			this.showSubMeny(1,0,3,count);
		})

    }

    showSubMeny(page, startId, pageSize, count) {
    	InventoryItem.getPage(startId, pageSize).then(items => {
			let ids = [],
				q = new GenericTemplate();
			items.forEach(item => {
				ids.push(item.get('id'));
				if (item.get('id') == 1) return;
				if (item.get('id') != 2) {
					q.addElement(
						new GenericElement({
							title: item.get('title'),
							item_url: "",
							image_url: item.get('image'),
							subtitle: item.get('description')
						}).addButton(new Button({
							action: item.get('id'),
							title: 'Buy',
							type: Button.POSTBACK,
						}))
					)
				} else {
					q.addElement(
						new GenericElement({
							title: item.get('title'),
							item_url: "",
							image_url: item.get('image'),
							subtitle: item.get('description')
						}).addButton(new Button({
							action: item.get('id'),
							title: 'Buy',
							type: Button.POSTBACK,
						})).addButton(new Button({
							action: 1,
							title: 'With extra chees 12$',
							type: Button.POSTBACK,
						}))
					)
				}
			});
			if (page * pageSize < count ) {
				q.addElement(
					new GenericElement({
						title: 'More Options',
					}).addButton(new Button({
						action: 'MORE',
						title: 'More',
						type: Button.POSTBACK,
					}))
				);
			}

			this.convo.ask(
				new Attachment(Attachment.TEMPLATE)
					.addPayload(q).getJSON(),
				(response, convo) => {
					this.updateContext(convo);
					if (ids.indexOf(parseInt(response.text)) >= 0) {
						this.checkOut(items.find(item => {
							return item.get('id') == parseInt(response.text);
						}));
						this.convo.next();
					} else if ('MORE' == response.text) {
						this.showSubMeny(page + 1, items[items.length - 1].get('id'), pageSize, count);
						this.convo.next();
					} else {
						this.convo.repeat();
						this.convo.next();
					}

				}
			)

		})



	}

	checkOut(inventoryItem) {
		this.askSeat(inventoryItem);
		// 	.then(seat_address => {
		// 	// this.convo.ask('Phone Number:', (response, convo) => {
		// 		this.updateContext(convo);
		// 		ted
		// 		this.order.addItem(inventoryItem);
		// 		this.finishOrderStep1();
		// 		this.convo.next();
		// 	// })
		// })
	}

	askSeat(inventoryItem) {
		return new Promise((resolve, reject) => {
			this.controller.storage.users.get(this.message.user, (err, user) => {
				console.log(user);
				if (user && user.get('data') && user.get('data').seat_address) {
					console.log(user.get('data'));
					let seat_address = user.get('data').seat_address;
					this.order.setSeatAddress(seat_address);
					this.order.addItem(inventoryItem);
					this.finishOrderStep1();
					this.convo.next();
					resolve(seat_address);
				} else {
					let seat_address = '';
					this.convo.ask('Section Number:', (response, convo) => {
						seat_address += `section: ${response.text}; `;
						this.updateContext(convo);
						this.convo.ask('Seat Number:', (response, convo) => {
							seat_address += `seat: ${response.text}; `;
							this.updateContext(convo);
							this.convo.ask('Row Number:', (response, convo) => {
								seat_address += `row: ${response.text}; `;
								this.updateContext(convo);
								this.controller.storage.users.save(
									{
										id: this.message.user,
										seat_address
									},
									(err, id) => {
										if (err) {
											logger.error('Error saving user', err);
											this.convo.stop();
											reject(err);
										} else {
											this.order.setSeatAddress(seat_address);
											this.order.addItem(inventoryItem);
											this.finishOrderStep1();
											this.convo.next();
											resolve(seat_address);
										}
									}
								);
							})
							this.convo.next();
						})
						this.convo.next();
					})
				}
			})

		})
	}

	finishOrderStep1() {
		const ACTIONS = {
			CHECKOUT: 'CHECKOUT',
			CONTINUE: 'CONTINUE',
		}

		this.convo.ask(
			new Attachment(Attachment.TEMPLATE)
				.addPayload(
					new ButtonsTemplate("Your order is being processed..")
						.addButton(new Button({
							action: ACTIONS.CHECKOUT,
							title: 'Checkout',
							type: Button.POSTBACK,
						}))
						.addButton(new Button({
							action: ACTIONS.CONTINUE,
							title: 'Add more',
							type: Button.POSTBACK,
						}))
				)
				.getJSON(),
			[
				{
					pattern: ACTIONS.CHECKOUT,
					callback: (response, convo) => {
						this.updateContext(convo);
						this.order.save().then(() => {
							this.finishOrderStep2();
							this.convo.next();
						})
					}
				},
				{
					pattern: ACTIONS.CONTINUE,
					callback: (response, convo) => {
						this.updateContext(convo);
						this.showMainMenu();
						this.convo.next();
					}
				},
				{
					default: true,
					callback: (response, convo) => {
						this.updateContext(convo);
						this.convo.repeat();
						this.convo.next();
					}
				},
			]

		);

	}

	finishOrderStep2() {
		const ACTIONS = {
			CONFIRM: 'CONFIRM',
			CANSCEL: 'CANCEL',
		}

		let orderTemplate = new Attachment(Attachment.TEMPLATE)
			.addPayload(
				new GenericTemplate()
					.addElement(
						new GenericElement({
							title: 'Order summary:',
							item_url: '',
							image_url: '',
							subtitle: this.order.getOrderText()
						})
							.addButton(new Button({
								action: ACTIONS.CONFIRM,
								title: 'Confirm',
								type: Button.POSTBACK,
							}))
							.addButton(new Button({
								action: ACTIONS.CANSCEL,
								title: 'Cancel',
								type: Button.POSTBACK,
							}))
					)
			);


		this.convo.ask(orderTemplate.getJSON(), [
			{
				pattern: ACTIONS.CONFIRM,
				callback: (response, convo) => {
					this.updateContext(convo);

					this.order.setStatus(Order.FINISHED);
					this.order.save().then(() => {
						this.order = null;
						this.convo.stop();
						this.start();
					})
				}
			},
			{
				pattern: ACTIONS.CANSCEL,
				callback: (response, convo) => {
					this.updateContext(convo);
					this.showMainMenu();
					this.convo.next();
				}
			},
			{
				default: true,
				callback: (response, convo) => {
					this.updateContext(convo);
					this.convo.repeat();
					this.convo.next();
				}
			},
		])
	}

}

module.exports = Menu;
