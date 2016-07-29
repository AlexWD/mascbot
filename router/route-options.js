'use strict';
let config = require('../config');
let buttonPaylod = require('../utils/data/button-payload.json');

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
		 	    name: `s${opts.section_id}r${opts.row_id}s${opts.seat_id}(${opts.order_id})`
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

	sendMessageOptions: function(channelId) {
	  return {
	  	method: 'POST',
	  	  uri: 'https://slack.com/api/chat.postMessage',
	  	  qs: {
	  	    token: config.slack['test-token'],
	  	    channel: channelId,
	  	    text: buttonPaylod.text,
	  	    attachments: JSON.stringify(buttonPaylod.attachments)
	  	  },
	  	  json: true
	  	}
	},

	sendFBBotOptions: function(opts) {
		// logic still a work in progress
		return {
			method: 'POST',
			  uri: 'some FB Bot uri',
			  body: opts,
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