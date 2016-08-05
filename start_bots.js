'use strict';
let server = require('./server.js');

require('./bots/slack_bot.js')(server).start_bot();
require('./bots/facebook_bot.js')(server).start_bot();

// require('./twilio_bot.js')(server).start_bot();