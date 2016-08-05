'use strict';

let routeOptions = require('../router/route-options.js');
let rp = require('request-promise');
let Runner = require('../models/runner.js');
let Order = require('../models/order.js');

function sendSlackMessage(opts) {
  return rp(routeOptions.sendSlackMessageOptions(opts))
          .catch((err) => {
            console.log('Error sending message to slack channel', err.message);
          })
}

function findTestChannel(res) {
  rp(routeOptions.findChannelOptions())
  .then(function(response) {
    var channelId = findTestChannelID(response.channels);
    sendMessage(channelId, res);
  })
  .catch((err) => {
    console.log(err)
  	res.sendStatus(500);
  });
}

function createSlackChannel(res, opts) {
	rp(routeOptions.createChannelOptions(opts))
	.then((response) => {
		// send buttons-payload options to created slack channel
		sendMessage(response.channel.id, res);
	})
}

function createPrivateSlackChannel(opts) {

  // Pull full list of private/group channels ever created
  return rp(routeOptions.listPrivateChannelsOptions())
          .then((data) => {

            var channelList = data.groups;

            // Check to see if the channel name that we are trying to create
            // already exists
            var channelExists = anyChannel(channelList, opts.channel_name);

            // If the channel doesn't exist
            if (!channelExists.answer) {
              // create it
              return rp(routeOptions.createPrivateChannelOptions(opts))
            }

            // Else return the channel id of the private channel
            return {
              group: {
                id: channelExists.channel_id
              }
            }
          })
}

function inviteUserToChannel(opts) {

  // Check that the user has not been already invited to the channel
  return rp(routeOptions.listGroupInfoOptions(opts))
          .then((data) => {
            var channelUsers = data.group.members;

            // Only invite the user if they are not already in the channel
            if (channelUsers.indexOf(opts.user) === -1) {
              return rp(routeOptions.inviteUserOptions(opts));
            }
          })
          .catch((err) => {
            console.log('Error inviting bot', err.message);
          })
}

function sendFBBotMessage(opts) {
	// logic still a work in progress
	rp(routeOptions.sendFBBotOptions(opts))
	.catch((err) => {
		console.log('Error sending message to FB bot:', err);
	})
}

function sendSlackBotmessage(opts) {
	rp(routeOptions.sendSlackBotOptions(opts))
	.catch((err) => {
		console.log('Error sending message to Slack bot:', err.message);
	})
}

function createAllRunners() {
	// logic still a work in progress
	return rp(routeOptions.generateRunnerListOptions())
	.then((response) => {

    // stub out the assigning of section_id for now
    let section_id = 0;
		response.members.forEach((slackMember) => {
			let runnerOpts = {
				slack_id: slackMember.id,
				first_name: slackMember.profile.first_name || '',
				last_name: slackMember.profile.last_name || '',
				email: slackMember.profile.email || '',
        section_id: section_id
			}

			// create the user is it doesn't already exist;
			// change logic to use just create
			Runner.findOrCreate({
				where: runnerOpts
			})

      section_id++;
		})
	})
}

function findTestChannelID(channelList, channelName) {
  var myChannelID = '';
  channelList.forEach((channel) => {
    if (channel.name === 'test-slack') {
      myChannelID = channel.id;
    }
  })
  return myChannelID;
}

function updateOrderInDb(opts) {

  // Find the order in our database
  Order.findOne({ where: {id: opts.id}})
  .then((order) => {

    // Update the order
    order.update({ order_status: opts.status.toUpperCase()})
    .catch((err) => {
      console.log('Error updating order:', err.message);
    })
  })
  .catch((err) => {
    console.log('Error finding order:', err.message);
  })
}

function anyChannel(array, value) {
  var answer = false;
  var channel_id = '';
  array.forEach((item) => {
    if (item.name === value) {
      answer = true;
      channel_id = item.id;
      return 
    }
  })

  return {
    answer: answer,
    channel_id: channel_id
  };
}

module.exports = {
	findTestChannel: findTestChannel,
	findTestChannelID: findTestChannelID,
	sendSlackMessage: sendSlackMessage,
	createSlackChannel: createSlackChannel,
	sendFBBotMessage: sendFBBotMessage,
	sendSlackBotmessage: sendSlackBotmessage,
	createAllRunners: createAllRunners,
	createPrivateSlackChannel: createPrivateSlackChannel,
	inviteUserToChannel: inviteUserToChannel,
  updateOrderInDb: updateOrderInDb
}