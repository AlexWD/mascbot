'use strict';
 
let Botkit = require('botkit');
let slackbot = Botkit.slackbot({
	interactive_replies: true,
});
let config = require('../config.js');
let payload = require('../utils/data/button-payload.json');
let rp = require('request-promise');

module.exports = (server) => {
	// just a simple way to make sure we don't
	// connect to the RTM twice for the same team
	let _bots = {};
	function trackBot(bot) {
	  _bots[bot.config.token] = bot;
	}

	// Configure slackbot
	slackbot.configureSlackApp({
	  clientId: config.slack['test-client-id'],
	  clientSecret: config.slack['test-secret'],
	  redirectUri: config.slack['redirect-uri'],
	  scopes: ['bot'],
	  storage: '',
	});

	slackbot.config.port = server.get('port');

	return {
		start_bot: () => {

			// create botkit endpoints
			slackbot
			.createHomepageEndpoint(server)
			.createWebhookEndpoints(server)
			.createOauthEndpoints(server, (err,req,res) => { 
				if (err) return res.status(500).send('Error:' + err);
				res.send('Success!');
			 });

			slackbot.on('create_bot',function(bot,config) {
			  if (_bots[bot.config.token]) {
			    // already online! do nothing.
			  } else {
			    bot.startRTM(function(err) {
			    	// this.slack_bot = bot;
			    	console.log(this);
			      if (!err) {
			        trackBot(bot);
			      }

			      bot.startPrivateConversation({user: config.createdBy}, (err,convo) => {
			        if (err) {
			          console.log(err);
			        } else {
			          convo.say('Hey, runner you have a new order');
			          convo.say('use channel ... to interact with the customer');
			        }
			      });

			    });
			  }

			});

			// Handle events related to the websocket connection to Slack
			slackbot.on('rtm_open',function(bot) {
			  console.log('** The RTM api just connected!');
			});

			slackbot.on('rtm_close',function(bot) {
			  console.log('** The RTM api just closed');
			  // you may want to attempt to re-open
			});

			// send payload once the bot is invited
			slackbot.on('bot_group_join', (bot, message) => {
				// save slack channel id to storage;
				bot.reply(message, 'section: 118,row: 16, seat: 7')
				bot.reply(message, 'Coke x 1, Hotdogs X 1')
				bot.reply(message, payload.initial);
			})

			// send message to fbbot upon slash command entry
			// slackbot.on('bot_group_join', (bot, message) => {
			// 	// save slack channel id to storage;
			// 	bot.reply(message, payload.initial);
			// })

			slackbot.on('interactive_message_callback', (bot,message) => {
				let action = message.actions[0].name;
				// need to work out logic for fbchannel
				let fbchannel = "1021852287930220";
				bot.replyInteractive(message, payload[action]);
				// send message appropriate message to either fb or user phone
				// send to https://3e67a900.ngrok.io/facebook/receive
				var date = new Date();
				rp({
					method: 'POST',
					uri: 'https://3e67a900.ngrok.io/facebook/receive',
					body: {
						object: 'page',
						entry: [{
							timestamp: date.getTime(),			
							messaging: [{
								sender: {id: '1021852287930220'},
								timestamp: date.getTime(),
								message: {
									text: action
								}
							}]
						}]
					},
					json: true
				})
			})

			// basic logic for user help event from facebook messenger

		}
	}
}
