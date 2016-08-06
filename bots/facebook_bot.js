'use strict';

const FacebookBot = require('../botapi/Facebook.js');
const config = require('../config');
const logger = require('../logger');
const Menu = require('../menu');
const db = require('../db');
const messages = require('../utils/messages/messages.js')
const helperFunctions = require('../utils/helper-functions.js');
const BotStorage = require('../botapi/postgres_storage');
const Promise = require('bluebird');



// for testing fb integration
// have to figure out a way to retrive the channel
// save channel data to storage
// query storage with some key that associates the runner to that specific channel

// ask user to put in the mascot of the stadium
	// on bot hear's "Get Started"
		// associated stadium to appropriate order
// remove storage creation for now

module.exports = (server) => {

	return {
		start_bot: () => {
      BotStorage({
        sequelize: db.sequelize,
        Sequelize: db.Sequelize,
      })
      .then(botStorage => {

        let menu = null;

        // Configure Facebook bot
        let controller = FacebookBot({
          storage: botStorage,
          debug: config.facebook.debug,
          logLevel: 7,
          access_token: config.facebook.page_token,
          verify_token: config.facebook.verify_token,
        });
        let bot = controller.spawn({});

        // Contains details about each order in each channel
        // rewrite to leverage bot storage 
        let channelStore = {};

        // Insert server into bot
        controller.createWebhookEndpoints(server, bot, (err, data) => {
          logger.info('ONLINE!');
        });

        controller.hears(['(.*)'], 'message_received', (bot, message) => {
          // Promisify botkit api
          Promise.promisifyAll(bot);

          // check our channelStore for the specific channel
          if (!channelStore[message.channel]) {

            // create it in store if it doesn't already exist
            channelStore[message.channel] = {
              message_origin: '',
              order: {}
            }
          }

          var channel = channelStore[message.channel]

          if (message.attachments && message.attachments.origin) {
            channel.message_origin = message.attachments.origin;
          } else {
            channel.message_origin = 'facebook'
          }

          // Only reason about status updates if the message origin is from slack
          if (message.text === 'status_update' && channel.message_origin  === 'slack') {

            var order = message.attachments.order;

            // Update the order
            channel.order = order;

            console.log('channelStore:', channelStore)

            // Alert User of the new status
            bot.replyAsync(message, messages[order.status])
            .then(() => {

              // Let user know that they can speak with the runner directly
              if (channel.order.status === 'picked_up') {
                bot.reply(message, messages.runner_connect['picked_up']);
              }
            })
          }

          // Reason about message from user when order status is picked up
          // "Open Connection"
          console.log(channel.order);
          if (channel.order.status === 'picked_up' && channel.message_origin === 'facebook') {

            // Alert User that their message was sent to runner
            // *** Naive Solution ***
            bot.reply(message, `sent to runner: ${message.text}`);

            console.log('channel in fb:', message);
            // send message to the runner - for testing
            // let slackchannel = 'G1WL7FJDS'; // for testing purposes

            // Send message to runner
            helperFunctions.sendSlackMessage({
              command: '/chat_runner',
              text: message.text,
              channel_id: channel.order.slack_channel_id,
              origin: 'facebook'
            })
            .catch((err) => {
              console.log('Error sending message to Slack bot:', err.message);
            })
          } 

          // Reason about message from runner to user
          if (message.text === 'chat_user' && channel.message_origin  === 'slack') {

            console.log('chat_user', message)
            // Display runner message to user
            bot.reply(message, `From runner: ${message.attachments.text}`);
          }

          if (message.text === 'help') {

            // We dont want this logic to work while channel is open to our runner
            if (channel.order.status !== 'picked_up') {
              bot.reply(message, 'one second as we connect you with an admin');

             // create new channel and invite admin
            } else {

            }
          }
        });

        controller.on('facebook_postback', (bot, message) => {

        });

        controller.on('facebook_optin', (bot, message) => {
            bot.reply(message, 'Welcome to my app!');

        });

        controller.on('message_received', (bot, message) => {
          if (!menu || !menu.convo.isActive()) {
            menu = new Menu(bot, message, controller);
          }
        });
      });
		}
	};
}