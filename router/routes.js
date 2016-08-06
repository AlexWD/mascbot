'use strict';

let helperFunctions = require('../utils/helper-functions.js');
let routeOptions = require('./route-options.js');
let rp = require('request-promise');
let OrderItem = require('../models/orderItem.js');
let Order = require('../models/order.js');
let Runner = require('../models/runner.js');
let config = require('../config.js');
let messages = require('../utils/messages/messages.js');
let date = new Date();

module.exports = (app) => {

	// work in progress for runner ui
	// app.get('/', (req, red) => {
	// 	// runner logs-in to slack with their daily section id;
			// update runner section id in DB;
			// redirect them to UI that shows their daily orders;
	// });

	app.post('/create/runners/db', (req, res) => {
		helperFunctions.createAllRunners()
		.then(() => {
			res.sendStatus(200);
		})
		.catch((err) => {
		  console.log(err)
			res.sendStatus(500);
		});
	})

	app.post('/order/ready', (req, res) => {
		// this end point requires that we receive an object
		// with the following format as the request body;
			/*
			{
				section_id: '',
				row_id: '',
				seat_id: '',
				order_id: '',
				order_item_id: '',
				order_details: '',
				source_id: '',
				source_name: ''
			}
			*/

		// let rd = req.body;

		// **********************************
		// Testing
		// section_id || row_id || seat_id most be changed everytime 
		// given that we are using those value to determine slack channel name
		// slack error's if you try to create the same channel

		let rd = {
			section_id: 121,
			row_id: 10,
			seat_id: 1,
			order_id: 1,
			order_item_id: 1,
			order_details: 'Coke x 1, Hotdog x 2',
			source_id: '1021852287930220', // facebook_channel_id or twilio number
			source_name: 'facebook'
		};

		// create Order in db

		let orderOpts = {
			id: 1,
			game: 'MLS v. Arsenal',
			phone: '8056371990',
			seat_address: 'section:118,row:16,seat:9',
			order_status: 'NEW',
			stadium: 'Avaya'
		};

		// Order.findOrCreate({ where: orderOpts})
		// .catch((err) => {
		// 	console.log('Error creating order:', err.message);
		// });

		// **********************************

		// save in database some how
		let opts = {};
	
		// ********
		// For this end point to work 
		// each runner must be associated with a section id
		// *********

		// Runner.find({ where: { section_id: rd.section_id} })

		// Runner.find({ where: { section_id: 9} })
    Runner.find({ where: { first_name: 'Abhi'} })
		.then((runner) => {
			opts.runner_data = {
				name: runner.first_name,
				slack_id: runner.slack_id,
				channel_name: `s${rd.section_id}r${rd.row_id}s${rd.seat_id}`
			}

			return helperFunctions.createPrivateSlackChannel(opts.runner_data);
		})
		.then((channel) => {

			// Save the channel id to our opts store
			opts.channel_id = channel.group.id;

			opts.invite_runner_data = {
				channel: opts.channel_id,
				user: opts.runner_data.slack_id
			};

			// invite the runner into the newly created channel
			return helperFunctions.inviteUserToChannel(opts.invite_runner_data);

		})
		.then(() => {

			// Find the slack id of our bot user
			// Every slack user (bot user  included) in our slack team 
			// Will be saved as a runner in the DB

			Runner.find({ where: { first_name: config.slack['bot-name']}})
			.then((bot) => {
				// invite bot user into the newly created channel
				opts.invite_bot_data = {
					channel: opts.channel_id,
					user: bot.slack_id,
					bot: true
				};

				helperFunctions.inviteUserToChannel(opts.invite_bot_data)
				.then(() => {

					// Send message after bot has been created
					// In order for the bot to listen to the message
					var message = messages.sendSlackOrderDetails(rd);

					var messageOptions = {
						command: '/display_order_details',
						text: message,
						channel_id: opts.channel_id,
						source_id: rd.source_id,
						source_name: rd.source_name, 
						order: {
							runner: opts.runner_data.name,
							order_id: rd.order_id
						},
						origin: 'server'
					}

					// Send order detail payload to slack channel
					helperFunctions.sendSlackMessage(messageOptions)

				})
			});
		})
		.then(() => {
			res.sendStatus(200);

		})
		.catch((err) => {
		  console.log('Error preparing slack channel', err.message)
			res.sendStatus(500);
		})
	});
}