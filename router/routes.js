'use strict';

let helperFunctions = require('../utils/helper-functions.js');
let routeOptions = require('./route-options.js');
let rp = require('request-promise');
let OrderItem = require('../models/orderItem.js');
let Order = require('../models/order.js');
let Runner = require('../models/runner.js');
let config = require('../config.js');

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
				order_item_id: ''
			}
			*/

		// let rd = req.body;

		let rd = {
			section_id: 118,
			row_id: 16,
			seat_id: 7,
			order_id: 1,
			order_item_id: 1
		}
		let opts = {};
	
		// ********
		// for this end point to work 
		// each runner must be associated with a section id
		// *********

		// Runner.find({ where: { section_id: rd.section_id} })

		Runner.find({ where: { first_name: 'Abhi'} })
		.then((runner) => {
			opts.runner_data = {
				name: runner.first_name,
				slack_id: runner.slack_id,
				section_id: rd.section_id,
				row_id: rd.row_id,
				seat_id: rd.seat_id,
				order_id: `${rd.order_id}-${rd.order_item_id}`
			}
			// create private slack channel
			return helperFunctions.createPrivateSlackChannel(opts.runner_data);
		})
		.then((slackChannel) => {
			// invite the runner into the newly created channel

			opts.channel_id = slackChannel.group.id
			opts.invite_runner_data = {
				channel: opts.channel_id,
				user: opts.runner_data.slack_id
			};
			helperFunctions.inviteUserToChannel(opts.invite_runner_data);

		})
		.then(() => {
			// find the slack id of our bot user
			// every slack user (bot user  included) in our slack team 
			// will be saved as a runner in the DB

			// we can also use botkit to identify the bot id and name
			// instead of making a find request to our db;

			Runner.find({ where: { first_name: config.slack['bot-name']}})
			.then((bot) => {
				// invite bot user into the newly created channel
				opts.invite_bot_data = {
					channel: opts.channel_id,
					user: bot.slack_id
				};

				helperFunctions.inviteUserToChannel(opts.invite_bot_data);

			});

			res.sendStatus(200);
		})
		.catch((err) => {
		  console.log(err)
			res.sendStatus(500);
		})
	});
}