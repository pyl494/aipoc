const dbutil = require('./dbutil.js');
const SQL = require("sql-template-strings");

export async function create_tables() {
	const evalQueueTableExists = await dbutil.tableExists('evalqueue');
	const evalHistoryTableExists = await dbutil.tableExists('webhook_history');
	const userConfigTableExists = await dbutil.tableExists('userconfig');

	if (!evalQueueTableExists) {
		await dbutil.createTable(
			SQL`CREATE TABLE evalqueue (
				self TEXT PRIMARY KEY,
				issueKey TEXT NOT NULL,
				clientKey TEXT NOT NULL,
				timestamp INTEGER NOT NULL
			);`
		);
	}

	if (!evalHistoryTableExists) {
		await dbutil.createTable(
			SQL`CREATE TABLE webhook_history (
				self TEXT PRIMARY KEY,
				issuekey TEXT NOT NULL 
			);`
		);
	}

	if (!userConfigTableExists) {
		await dbutil.createTable(
			SQL`CREATE TABLE userconfig (
				clientKey TEXT PRIMARY KEY,
				auto_eval_delay INTEGER NOT NULL,
				auto_eval_enabled BOOLEAN NOT NULL,
				auto_eval_risk_comment TEXT NOT NULL
			);
		`);
	}

}


export async function insert_into_his(_self, issuekey) {
	return await dbutil.insert(SQL`INSERT INTO 
		webhook_history (self, issuekey) 
		VALUES (${_self}, ${issuekey});`);

}

export async function insert_into_queue(self, issueKey, clientKey, timestamp) {

	return await dbutil.insert(SQL`INSERT INTO 
		evalqueue (self, issuekey, clientKey, timestamp) 
		VALUES (${self}, ${issueKey}, ${clientKey}, ${timestamp});`);

}

export async function is_in_webhook_history(_self) {
	const out = await dbutil.selectOne(SQL`SELECT issuekey FROM webhook_history WHERE self = ${_self}`);
	return out.found;

}

export async function remove_from_queue(self) {
	return await dbutil.modify(SQL`DELETE FROM evalqueue WHERE self = ${self};`);

}

export async function remove_from_history_using_self(self) {
	return await dbutil.modify(SQL`DELETE FROM webhook_history WHERE self = ${self}`);

}

