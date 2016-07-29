'use strict';

let buttonPayload = require('./data/button-payload.json');
let routeOptions = require('../router/route-options.js');
let rp = require('request-promise');
let Runner = require('../models/runner.js');

function sendMessage(channelId, res) {
  rp(routeOptions.sendMessageOptions(channelId))
  .then(function(response) {
    res.sendStatus(200);
  });
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
	return rp(routeOptions.createPrivateChannelOptions(opts))
}

function inviteUserToChannel(opts) {
	return rp(routeOptions.inviteUserOptions(opts))
}

function sendFBBotMessage(res, opts) {
	// logic still a work in progress
	rp(routeOptions.sendFBBotOptions(opts))
	.then((response) => {
		res.sendStatus(200);
	})
}

function createAllRunners() {
	// logic still a work in progress
	return rp(routeOptions.generateRunnerListOptions())
	.then((response) => {
		response.members.forEach((slackMember) => {
			let runnerOpts = {
				slack_id: slackMember.id,
				first_name: slackMember.profile.first_name || '',
				last_name: slackMember.profile.last_name || '',
				email: slackMember.profile.email || '',

			}
			// create the user is it doesn't already exist;
			// change logic to use just create
			Runner.findOrCreate({
				where: runnerOpts
			})
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

module.exports = {
	findTestChannel: findTestChannel,
	findTestChannelID: findTestChannelID,
	sendMessage: sendMessage,
	createSlackChannel: createSlackChannel,
	sendFBBotMessage: sendFBBotMessage,
	createAllRunners: createAllRunners,
	createPrivateSlackChannel: createPrivateSlackChannel,
	inviteUserToChannel: inviteUserToChannel
}