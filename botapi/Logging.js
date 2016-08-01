'use strict';

const Log = require('../models/models').Log;

class ConversationLogger {

	constructor() {

	}

	static saveLog(request, reply, userId) {
		Log.create({
			UserId: userId,
			request,
			reply,
		})
	}

}

module.exports = ConversationLogger;
