'use strict';
let config = require('../config');

module.exports = {
	// create a channel for our runner
	// channel name should reflect runners name - order section and seat
	createChannelOptions: function() {
	  return {
		 	method: 'POST',
	 	  uri: 'https://slack.com/api/channels.create',
	 	  qs: {
	 	    token: config.slack['test-token'],
	 	    name: `${opts.name}-section${opts.section_id}seat${opts.seat_id}(${opts.order_id})`
	 	  },
	 	  json: true
    }
	},

	createPrivateChannelOptions: function(opts) {
	  return {
		 	method: 'POST',
	 	  uri: 'https://slack.com/api/groups.create',
	 	  qs: {
	 	    token: config.slack['test-token'],
	 	    name: opts.channel_name
	 	  },
	 	  json: true
	  }
	},

	listPrivateChannelsOptions: function() {
		return {
	    method: 'POST',
	    uri: 'https://slack.com/api/groups.list',
	    qs: {
	      token: config.slack['test-token'],
	    },
	    json: true
	  }
	},

	listGroupInfoOptions: (opts) => {
		return {
			method: 'POST',
			uri: 'https://slack.com/api/groups.info',
			qs: {
			  token: config.slack['test-token'],
			  channel: opts.channel
			},
			json: true
		}
	},

	inviteUserOptions: function(opts) {
	  return {
		 	method: 'POST',
	 	  uri: 'https://slack.com/api/groups.invite',
	 	  qs: {
	 	    token: config.slack['test-token'],
	 	    channel: opts.channel,
	 	    user: opts.user
	 	  },
	 	  json: true
    }
	},

	findChannelOptions: function() {
	  return {
	  	method: 'POST',
  	  uri: 'https://slack.com/api/channels.list',
  	  qs: {
  	    token: config.slack['test-token']
  	  },
  	  json: true
  	}
	},

	sendSlackMessageOptions: function(opts) {
	  return {
	  	method: 'POST',
  	  uri: 'https://runner-bot.herokuapp.com/slack/receive',
  	  body: {
  	  	command: opts.command,
  	  	team_id: config.slack['team-id'],
  	  	user_id: config.slack['bot-id'],
  	  	channel_id: opts.channel_id,
	  		text: opts.text,
	  		origin: opts.origin,
	  		source_id: opts.source_id || '',
	  		source_name: opts.source_name || '',
  	    attachments: opts.attachments || '',
  	    order: opts.order || {}
  	  },
  	  json: true
  	}
	},

  removeBotUserOptions: function(opts) {
    return {
      method: 'POST',
      uri: 'https://slack.com/api/groups.kick',
      qs: {
        token: config.slack['test-token'],
        channel: opts.channel,
        user: opts.user
      },
      json: true
    }
  },

	sendFBBotOptions: function(opts) {
		var date = new Date();

		return {
			method: 'POST',
			uri: 'https://runner-bot.herokuapp.com/facebook/receive',
			body: {
				entry: [{	
					messaging: [{
						sender: {
							id: opts.channel
						},
						timestamp: date.getTime(),
						message: {
							text: opts.text,
							attachments: opts.attachments
						},
					}]
				}]
			},
			json: true
		}
	},

	sendSlackBotOptions: function(opts) {
	  return {
	  	method: 'POST',
  	  uri: 'https://runner-bot.herokuapp.com/slack/receive',
  	  body: {
  	  	trigger_word: true,
  	  	team_id: config.slack['team-id'],
  	  	user_id: config.slack['bot-id'],
  	  	channel_id: opts.channel_id,
	  		text: opts.text,
	  		origin: opts.origin
  	  },
  	  json: true
  	}
	},

	generateRunnerListOptions: function() {
		return {
			method: 'POST',
		  uri: 'https://slack.com/api/users.list',
		  qs: {
		    token: config.slack['test-token']
		  },
		  json: true
		}
	}
};