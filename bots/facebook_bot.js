'use strict';

const Botkit = require('botkit');
const config = require('../config');
const logger = require('../logger');
const Menu = require('../menu');
const db = require('../db');
const fbmessages = require('../utils/data/messages.json');
// const events = require('events');
// let emitter = new events.EventEmitter();
// const BotStorage = require('../botapi/postgres_storage');
let facebookbot = Botkit.facebookbot({
	access_token: config.facebook.page_token,
	verify_token: config.facebook.verify_token
});

let spawnedBot = facebookbot.spawn({});

// for testing fb integration
// have to figure out a way to retrive the channel
// save channel data to storage
// query storage with some key that associates the runner to that specific channel

// ask user to put in the mascot of the stadium
	// on bot hear's "Get Started"
		// associated stadium to appropriate order
// remove storage creation for now
module.exports = {
	fb_bot: spawnedBot,
	start_bot: (server, emitter) => {

		// spawnedBot.say(message);
		facebookbot.config.port = server.get('port');
		let menu = null;

		// insert bot into server
		facebookbot.createWebhookEndpoints(server, spawnedBot, () => {
			logger.info('ONLINE!');
		});

		facebookbot.hears(['hello'], 'message_received', function(bot, message) {
				// console.log(message)
		    bot.reply(message, 'Hey there.');

		});

		facebookbot.hears(['help'], 'message_received', function(bot, message) {
			// ideally we want to start a conversation with the user and relay that 
			// response to slack
		    bot.reply(message, 'One moment, as we connect you to your runner.');
		    // emitter.emit('help');

		});

		facebookbot.hears(['picked_up', 'delivered', 'cancel'], 'message_received', function(bot, message) {
		    bot.reply(message, fbmessages[message.text.toLowerCase()]);

		});


		facebookbot.on('facebook_postback', (bot, message) => {

		});

		facebookbot.on('facebook_optin', function(bot, message) {
				console.log(message)
				// save the channel id data somewhere
		    bot.reply(message, 'Welcome to my app!');

		});
	}
}