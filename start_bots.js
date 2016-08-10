'use strict';
let server = require('./server.js');

let slackBot = require('./bots/slack_bot.js')(server);
slackBot.start_bot();

// let facebookBot = require('./bots/facebook_bot.js')(server);
// facebookBot.start_bot();

// require('./twilio_bot.js')(server).start_bot();