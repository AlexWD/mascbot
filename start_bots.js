'use strict';
let server = require('./server.js');

// let facebookBot = require('./bots/facebook_bot.js')({server: server, emitter: slackemitter}).start_bot();
let facebookBot = require('./bots/facebook_bot.js');
let slackBot = require('./bots/slack_bot.js')(server);

slackBot.start_bot();
facebookBot.start_bot(server);