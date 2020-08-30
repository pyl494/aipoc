const axios = require('axios');
const moment = require('moment');
const dbutil = require('./dbutil.js');
const util = require('./util.js')
const dbmanage = require('./dbmanage.js');
var issuequeue = require('./issuequeue.js');
const { reject, resolve } = require('bluebird');
const check = require('./check.js');
const risk_levels = require('./risk.js');

const default_client_settings = require('./default_client_config.json');

// Gets an issue, the issues linked to it, using the REST API given a clientKey for authentication.
async function get_issue_and_linked ( issueKey, clientKey, addon ) {
	var issue_and_linked = [];

	var httpClient = addon.httpClient({
		clientKey: clientKey
	});

	const result = await new Promise((resolve, reject) => {
		httpClient.get({
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			"url": "/rest/api/3/search?jql=" + encodeURI(`issueKey = ${issueKey} OR issue in linkedIssues(${issueKey})`) + "&maxResults=999999&fields=*all&expand=names"
		},
		function(err, response, body) {
			if (err) { 
				resolve(err);
			}
			else {
				issue_and_linked = JSON.parse(body);
				resolve(body);
			}
		});
	});

	var issues = issue_and_linked.issues;
	
	return issues;
}

// For app.post('/webhook-issue-created') -> setTimeout()
async function delayed_evaluation(issue, clientKey, addon) {
	var issueKey = issue.key;
	var issueSelf = issue.self;

	const db_client_config = await dbutil.selectOne(SQL`
		SELECT * FROM userconfig
		WHERE clientKey = ${req.context.clientKey};
	`);

	const client_config = db_client_config.found ? db_client_config.result : default_client_settings;

	dbmanage.remove_from_queue(issueSelf);
	issuequeue.queue[issue.self] = null;

	var issues = await get_issue_and_linked(issueKey, clientKey, addon);

	var last_updated = await get_last_updated(issues);

	const axios_add_resp = await axios({ 
		method: 'post',
		url: 'http://localhost:8080/micro?type=add',
		headers: {},
		data: {
			issues: issues
		}
	});

	const axios_hs_resp = await axios({ 
		method: 'post',
		url: `http://localhost:8080/micro?type=handshake&change_request=${issueKey}&updated=${last_updated}`,
		headers: {},
		data: {
			issues: issues
		}
	});

	console.log(axios_hs_resp);

	var handshake_features = axios_hs_resp.features;
	//var features = await get_feature_breakdown(handshake_features);
	var prediction_data = axios_hs_resp.data.predictions;

	if ((axios_hs_resp.data.manual == null || axios_hs_resp.data.manual == 'None') 
		&& prediction_data !== null
		&& typeof(prediction_data) !== 'undefined' 
		&& prediction_data != '') {

		const risk = await get_prediction_from_set(prediction_data);

		evaluation_lozange_set(addon, clientKey, issueKey, risk);

		if (check_risk_comment_level(risk, client_config)) {
			const comment_data = get_comment_data(client_config);
			create_comment(addon, clientKey, issueKey, comment_data);
		}
	}
}


async function get_evaluation(issue) {

}

// Find the last updated issue time.
async function get_last_updated(issues) {
	let last_updated = -1;
	for (var i = 0; i < issues.length; i++) {
		if (last_updated === -1){
			if ('updated' in issues[i].fields)
				last_updated = issues[i].fields.updated;
			else
				last_updated = issues[i].fields.created;
		}
		else{
			if ('updated' in issues[i].fields && issues[i].fields.updated > last_updated)
				last_updated = issues[i].fields.updated;
			else if (issues[i].fields.created > last_updated)
				last_updated = issues[i].fields.created;
		}
	}
	return last_updated;
}

// Extracts the feature breakdown from the list of features given.
async function get_feature_breakdown(features) {
	if (!check.isDefined(features)) {
		return null;
	}

	var feature_breakdown = [];

	for(var i = 0; i<5; i++) {

		feature_breakdown[i] = {
			name: "name",
			value: "0",
			weight: "0"
		}

		//name
		feature_breakdown[i]["name"] = features[Object.keys(features)[0]][i][0];

		//store help text according to these
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('number_of', 'number of');
		//features[i]["name"] = features[i]["name"].replace('name', '');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('sum', '(sum)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('stdev', '(stdev)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('mean', '(mean)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('median', '(median)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('variance', '(variance)');

		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(/_/g, ' ');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(
			/\w\S*/g,
			function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);

		//value
		feature_breakdown[i].value = features[Object.keys(features)[0]][i][1];
	
		//weight
		feature_breakdown[i].weight = features[Object.keys(features)[0]][i][2];
	}

	console.log("Feature breakdown: " + feature_breakdown);

	return feature_breakdown;
}

async function get_prediction_from_set(prediction_data) {
	var risk_set = "";
	var lower_count = 0;
	var medium_count = 0;
	var high_count = 0;

	for (const [x, y] of Object.entries(prediction_data)) { 
		if (y.toLowerCase() == "low") {lower_count++;}
		else if (y.toLowerCase() == "medium") {medium_count++;}
		else if (y.toLowerCase() == "high") { high_count++;}
	}

	if (lower_count > medium_count && lower_count > high_count) {
		risk_set = "Low Risk";
	}
	else if (medium_count > high_count) {
		risk_set = "Medium Risk";
	}
	else {
		risk_set = "High Risk";
	}

	return risk_set;

}

async function evaluation_lozange_set(addon, clientKey, issueKey, risk) {

	var lozange_set = '';

	switch(risk) {
		case 'Low Risk':
			lozange_set = 'success';
			break;
		case 'Medium Risk':
			lozange_set = 'moved';
			break;
		case 'High Risk':
			lozange_set = 'remvoed';
			break;
	}

	util.set_issue_lozange(addon, clientKey, issueKey, risk, lozange_set);
}

// Set the lozange.
async function evaluation_lozange_set_from_data(addon, clientKey, prediction_data, issue_key) {

	var risk_set = "";
	var lozenge_set = "";
	var lower_count = 0;
	var medium_count = 0;
	var high_count = 0;

	for (const [x, y] of Object.entries(prediction_data)) { 
		if (y.toLowerCase() == "low") {lower_count++;}
		else if (y.toLowerCase() == "medium") {medium_count++;}
		else if (y.toLowerCase() == "high") { high_count++;}
	}


	if (lower_count > medium_count && lower_count > high_count) {
		risk_set = "Low Risk";
		lozenge_set = "success";

	}
	else if (medium_count > high_count) {
		risk_set = "Medium Risk";
		lozenge_set = "moved"
	}
	else {
		risk_set = "High Risk";
		lozenge_set = "removed"
	}

	util.set_issue_lozange(addon, clientKey, issue_key, risk_set, lozenge_set);
}

/** 
 * @param commentData {object}
 * @param issueKey {string}
 * @param clientKey {string}
*/
async function create_comment (addon, clientKey, issueKey, commentData) {
	 await new Promise((reject, resolve) => {
		var httpClient = addon.httpClient( {clientKey: clientKey });

		httpClient.post({
			"headers": {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			"url": `/rest/api/3/issue/${issueKey}/comment`,
			"body": commentData
		},
		function(err, response, body) {
			if (response == 200) {
				resolve(body);
			}
			else {
				reject(err);
			}
		});
	});
}

/** 
 * @param risk {string}
*/
function check_risk_comment_level(risk, config) {
	switch(config.auto_eval_risk_level_warn) {
		case "High Risk Only":
			if (risk == "High Risk") {
				return true;
			}
			return false;
		case "Medium Risk Only":
			if (risk == "Medium Risk") {
				return true;
			}
			return false;
		case "Low Risk Only":
			if (risk == "Low Risk") {
				return true;
			}
			return false;
		case "Medium Risk Above":
			return risk_levels[risk] >= 1;
		case "Low Risk Above":
			return true;
		case "No Comment":
			return false;
	}
	return true;

}

function get_comment_data(config) {
	const comment = {
		"body": {
			"type": "doc",
			"version": 1,
			"content": [
				{ "type": "paragraph", 
				"content": [
					{
						"text": config.auto_eval_comment,
						"type": "text"
					}
				]
			}]
		}
	};

	return comment;
}

module.exports = {
	delayed_evaluation: delayed_evaluation,
	create_comment: create_comment,
	get_feature_breakdown: get_feature_breakdown,
	get_last_updated: get_last_updated,
	evaluation_lozange_set_from_data: evaluation_lozange_set_from_data
}