'use strict';
 
let Botkit = require('botkit');
let config = require('../config.js');
let payload = require('../utils/messages/button-payload.json');
let helperFunctions = require('../utils/helper-functions.js');
let messages = require('../utils/messages/messages.js');
let BotStorage = require('../botapi/postgres_storage');
let db = require('../db');
let Promise = require('bluebird');

module.exports = (server) => {

	return {
		start_bot: () => {

			BotStorage({
				sequelize: db.sequelize,
				Sequelize: db.Sequelize,
			})
			.then(botStorage => {
				let slackbot = Botkit.slackbot({
					interactive_replies: true,
					storage: botStorage
				});

				// Configure slackbot
				slackbot.configureSlackApp({
				  clientId: config.slack['test-client-id'],
				  clientSecret: config.slack['test-secret'],
				  redirectUri: config.slack['redirect-uri'],
				  scopes: ['bot'],
				});
				slackbot.config.port = server.get('port');

				let bot = slackbot.spawn({})

				// just a simple way to make sure we don't
				// connect to the RTM twice for the same team
				let _bots = {};
				let spawnedBot = {};
				function trackBot(bot) {
				  _bots[bot.config.token] = bot;
				}

				// refactor to use bot storage
				var channelStore = {};

				// create botkit endpoints
				slackbot
				.createHomepageEndpoint(server)
				.createWebhookEndpoints(server)
				.createOauthEndpoints(server, (err,req,res) => { 
				  if (err) return res.status(500).send('Error:' + err);
				  res.send('Success!');
				 });

				slackbot.on('create_bot',function(bot,config) {

				  spawnedBot = bot;
				  if (_bots[bot.config.token]) {
				    // already online! do nothing.
				  } else {
				    bot.startRTM(function(err) {
				      if (!err) {
				        trackBot(bot);
				      }

				      bot.startPrivateConversation({user: config.createdBy}, (err,convo) => {
				        if (err) {
				          console.log(err);
				        } else {
				          convo.say('Runner Bot is ONLINE!!!');
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
				  // bot.startRTM()
				});

				// send payload once the bot is invited
				slackbot.on('bot_group_join', (bot, message) => {

				  channelStore[message.channel] = {};

				  // Once the bot has joined the channel send order status buttons
				  // might need a set timout  to delay payload 
				  // bot.reply(message, payload.initial);
				})

				/*
				  ORDER STATUS BUTTONS
				*/
				slackbot.on('interactive_message_callback', (bot,message) => {
				  let status = message.actions[0].name;
				  let channel = channelStore[message.channel];
				  let source_id = channel.source_id;
				  let source_name = channel.source_name;

				  bot.replyInteractive(message, payload[status]);

				  // Update the status of the order in the channel
				  channel.order_status = status;

				  // Update the status of the order in the Database
				  helperFunctions.updateOrderInDb({
				    id: channel.order.order_id,
				    status: status
				  })

				  // Update the user of change in order status
				  if (source_name === 'facebook') {
				    helperFunctions.sendFBBotMessage({
				      channel: source_id,
				      text: 'status_update',
				      attachments: {
				        origin: 'slack', 
				        order: {
				          status: status,
				          facebook_channel_id: source_id,
				          slack_channel_id: message.channel,
				        }
				      },
				    })
				  } else if (source_name === 'twilio') {

				  }

				  if (channel.order_status === 'picked_up' && !channel.pick_up_triggered) {

				    // Alert runner that he can speak with the user directly
				    bot.reply(message, `Hey ${channel.runner} connection openned with the user. Use \`/chat_user\` to speak with them directly.`)
				    channel.pick_up_triggered = true;
				  }
				})

				/*
				  SLASH COMMANDS
				*/
				slackbot.on('slash_command', (bot, message) => {
					// Promisify botkit api
				  Promise.promisifyAll(spawnedBot);
				  Promise.promisifyAll(bot);
				  
				  let channel = channelStore[message.channel];

				  if (message.command === '/display_order_details' && message.origin === 'server') {
				  console.log('display_order_details:', message)

				    // Save order details to channel;
				    channel.source_id = message.source_id;
				    channel.source_name = message.source_name;
				    channel.runner = message.order.runner;
				    channel.order = message.order;

				    let orderMessage = {
				      "text": message.text,
				      "attachments": JSON.stringify(message.text)
				    }

				    // Display order details to runner
				    	// have to use spawned bot here to display these messages
				    spawnedBot.replyAsync(message, message.text)
				    .then(() => {

				    	// Display status buttons
				  		spawnedBot.reply(message, payload.initial);
				    })

				  }


				  if (message.command === '/chat_user') {

				    // Only allow runner to chat the user associated with the
				    // order in that given channel and 
				    // only once the order has been picked up
				    if (channel && channel.order_status === 'picked_up') {

				      let sourceId = channel.source_id;
				      let slash_reply = messages.slash_reply();
				      slash_reply.attachments[0].text = message.text;
				      
				      // Alert runner that the message was sent
				      spawnedBot.reply(message, slash_reply);

				      // Check the source name to from where the user ordered
				      if (channel.source_name === 'facebook') {

				        // Send user the message
				        helperFunctions.sendFBBotMessage({
				          channel: sourceId,
				          text: 'chat_user',
				          attachments: {
				            origin: 'slack',
				            text: message.text
				          }
				        })
				      } else if (source_name === 'twilio') {

				      }
				    } else {

				      spawnedBot.reply(message, 'A connection has not been established with the user');
				    }

				  }

				  if (message.command === '/chat_runner') {

				  	console.log('chat_runner:', message)

				    if (message.origin === 'facebook') {
				      let fb_user_slack_msg = messages.fb_user_msg();
				      fb_user_slack_msg.attachments[0].text = message.text;

				      console.log('fb_user_slack_msg', fb_user_slack_msg);

				      // Display user message to runner
				      spawnedBot.reply(message, fb_user_slack_msg);
				      // bot.reply(message, fb_user_slack_msg);


				    } else if (message.origin === 'twilio') {

				    }

				  }

				  // Stops slack from sending a timeout error message to our runner
				  bot.res.send('');

				});

			});

		}
	}
}
