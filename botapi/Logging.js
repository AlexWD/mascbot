'use strict';

const Log = require('../models/models').Log;

class ConversationLogger {

	constructor() {

	}

	static saveMessage(request, reply, convoId, userId) {
		Log.create({
			UserId: userId,
			request,
			reply,
			ConversationId: convoId,
		})
	}

	static saveConv(convoId, userId) {
		Log.create({
			UserId: userId,
			id: convoId,
		})
	}

}

module.exports = ConversationLogger;
