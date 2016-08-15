'use strict';
let server = require('./server.js');

let slackBot = require('./bots/slack_bot.js')(server);
slackBot.start_bot();
