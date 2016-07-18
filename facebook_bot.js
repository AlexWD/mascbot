'use strict';

const Botkit = require('botkit');
const config = require('./config');
const logger = require('./logger');
const Menu = require('./menu');
const db = require('./db');
const BotStorage = require('./botapi/postgres_storage');

BotStorage({
	sequelize: db.sequelize,
	Sequelize: db.Sequelize,
}).then(botStorage => {

	const controller = Botkit.facebookbot({
		storage: botStorage,
		debug: config.bot.debug,
		access_token: config.bot.page_token,
		verify_token: config.bot.verify_token,
	});

	const bot = controller.spawn({});
	let menu = null;

	// get port from heroku
	controller.setupWebserver(process.env.PORT || config.bot.port || 3000, (err, webserver) => {
		controller.createWebhookEndpoints(webserver, bot, () => {
			logger.info('ONLINE!');
		});
	});

	controller.on('facebook_postback', (bot, message) => {

	});

	controller.on('message_received', (bot, message) => {
		if (!menu || !menu.convo.isActive()) {
			menu = new Menu(bot, message, controller);
		}
	});

	controller.on('tick', (bot, message) => {
		//empty
	});

}).catch(e => logger.error(e));



