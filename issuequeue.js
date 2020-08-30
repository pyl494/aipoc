const moment = require('moment');
const dbutil = require('./dbutil.js');
const SQL = require('sql-template-strings');
const evaluation_functions = require('./evaluation.js');

var issuequeue = { };

async function loadQueue(addon) {

	const queue = await dbutil.select(SQL`
		SELECT * FROM evalqueue;
	`);

	for (var i = 0; i < queue.length; i++) {
		const current = queue[i];

		/* ===============================
		self TEXT PRIMARY KEY,
		issueKey TEXT NOT NULL,
		clientKey TEXT NOT NULL,
		timestamp INTEGER NOT NULL
		================================ */

		var currentIssueTime = moment(current.timestamp);
		var currentTime = moment();
		
		if (currentTime > currentIssueTime) {
			evaluation_functions.delayed_evaluation(
				{ key: current.issueKey, self: current.self },
				current.clientKey,
				addon
			);
		}
		else {
			var timewait = currentTime - currentIssueTime;
			issuequeue[issue.self] = setTimeout(
				evaluation_functions.delayed_evaluation
				, timewait, { key: current.issueKey, self: current.self }, current.clientKey, addon
			);
		}
	}

}

module.exports = {
	queue: issuequeue,
	loadQueue: loadQueue 
};