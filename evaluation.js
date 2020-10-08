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
const SQL = require('sql-template-strings');

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

async function delay_evaluation_loop(addon) {
	const currentTime = moment();
	const cTime = currentTime.valueOf();

	console.log("delay_evaluation_loop: " + currentTime.format("dddd, MMMM Do YYYY, h:mm:ss:SSSS a"));

	var validIssuesQuery = await dbutil.select(SQL`
		SELECT * FROM evalqueue
		WHERE timestamp <= ${cTime}
		ORDER BY timestamp ASC;
	`);

	console.log('found valid issues: ' + validIssuesQuery.result.length);

	if (!validIssuesQuery.found) {
		setTimeout(
			delay_evaluation_loop,
			30*1000, addon
		); // Let's have a looksie in 30 seconds.
		return;
	}

	for (const issue of validIssuesQuery.result) {
		var argIssue = {
			"key": issue.issueKey,
			"self": issue.self
		};
		try {
			await delayed_evaluation(argIssue, issue.clientKey, addon);
		}
		catch (ex) {
			console.log('Caught Exception: ' + ex);
		}
	}

	setTimeout(
		delay_evaluation_loop,
		30*1000, addon
	); // Let's have a looksie in 30 seconds.


}

// For app.post('/webhook-issue-created') -> setTimeout()
async function delayed_evaluation(issue, clientKey, addon) {
	var issueKey = issue.key;
	var issueSelf = issue.self;

	const db_client_config = await dbutil.selectOne(SQL`
		SELECT * FROM userconfig
		WHERE clientKey = ${clientKey};
	`);

	const client_config = db_client_config.found ? db_client_config.result : default_client_settings;

	dbmanage.remove_from_queue(issueSelf);
	//issuequeue.queue.delete(issueSelf);

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
		url: `http://localhost:8080/micro?type=handshake&change_request=${encodeURIComponent(issueKey)}&updated=${encodeURIComponent(last_updated)}`,
		headers: {},
		data: {
			issues: issues
		}
	});

	//var features = await get_feature_breakdown(handshake_features);
	var prediction_data = axios_hs_resp.data.predictions;

	if ((axios_hs_resp.data.manual == null || axios_hs_resp.data.manual == 'None') 
		&& prediction_data !== null
		&& typeof(prediction_data) !== 'undefined' 
		&& prediction_data != '') {

		const risk = await get_prediction_from_set(prediction_data);

		evaluation_lozange_set(addon, clientKey, issueKey, risk);

		if (check_risk_comment_level(risk, client_config)) {

			const template_context = {
				risk: risk,
				issue_key: issueKey
			};

			const comment_data = get_comment_data(client_config, template_context);
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


	for(var i = 0; i<features[Object.keys(features)[0]].length; i++) {

		feature_breakdown[i] = {
			name: "name",
			value: "0",
			weight: "0",
			tooltip: "lorum ipsum"
		}

		//name
		feature_breakdown[i]["name"] = features[Object.keys(features)[0]][i][0];
		
		//list of feature tooltips -> could become a json file loaded or a database table
		tooltips = {
			"Number Of Issuetype Name Task":"Issue types distinguish different types of work in unique ways, and help you identify, categorize, and report on your team’s work across your Jira site. They can help your team build more structure into your working process.",
			"Number Of Changes To Assignee Name":"JIRA Assignee is typically the account that is working on the JIRA issue.",
			"Number Of Changes To Assignee Displayname":"JIRA Assignee is typically the account that is working on the JIRA issue.",
			"Number Of Changes To Fixversion Names":"Fix version is the version where you plan on releasing a feature or bugfix to customers. This field is used for release planning, monitoring progress and velocity, and is used widely in reporting. This is most likely the field you want.",
			"Number Of Changes To Description":"An issue description describes the ticket. Depending on how your team uses Jira, an issue could represent a project task, a helpdesk ticket, a leave request form, etc. In Jira Software, issues typically represent things like big features, user requirements, and software bugs",
			"Number Of Changes To Components":"Components are subsections of a project. They are used to group issues within a project into smaller parts. You can set a default assignee for a component. This will override the project's default assignee, for issues in that component.",
			"Number Of Comments":"Comments can range from simple text updates to let watchers know what's happening on the issue, to code snippets, images, tables, and more.",
			"Discussion Time":"A field used to recorder the time spent in discussion as part of the issue or Jira sprints.",
			"Number Of Changes To Resolution Name":"Resolutions are the ways in which an issue can be closed. JIRA applications ship with a set of default resolutions, but you can add your own.",
			"Number Of Changes To Affectversion Names":"Project version(s) for which the issue is (or was) manifesting.",
			"Delays":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Elapsed Time":"Time recorded on an issue.",
			"Number Of Blocks Issues":"Linked issues can be blocking preventing progress on one before the other is complete.",
			"Number Of Bugs":"An issue type indicating a bug in the project.",
			"Number Of Changes To Labels":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Number Of Changes To Project Key":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Number Of Changes To Reporter Name":"JIRA Reporter is usually auto-poppulated for whoever created the JIRA issue.",
			"Number Of Changes To Security Name":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Number Of Changes To Summary":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Number Of Changes To Timeestimate":"A field on this issue indicating the estimated time to completion.",
			"Number Of Features":"The number of fields and content availble through this issue detected by RiskEvader.",
			"Number Of Issues":"Jira issues in the project.",
			"Number Of Other":"This feature has affected the outcome of the machine learning prediction made on this issue.",
			"Number Of Participants":"A participant is someone who has contributed, or been named by an agent on a Jira issue.",
			"Number Of Status Name Closed":"Each issue has a status, which indicates where the issue currently is in its lifecycle ('workflow'). An issue starts as being 'Open', then generally progresses to 'Resolved' and then 'Closed'.",
			"Number Of Improvements":"A type of Jira issue: An enhancement to an existing feature.",
			"Number Of Priority Name Blocker":"The importance of the issue in relation to other issues."
		};

		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('number_of', 'number of');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(' sum', '(sum)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('stdev', '(stdev)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('mean', '(mean)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('median', '(median)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('variance', '(variance)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('max', '(max)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('min', '(min)');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(/_/g, ' ');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(
			/\w\S*/g,
			function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);

		
		tempFeatureName = feature_breakdown[i]["name"]
		tempFeatureName = tempFeatureName.replace(' (Sum)', '');
		tempFeatureName = tempFeatureName.replace(' (Stdev)', '');
		tempFeatureName = tempFeatureName.replace(' (Mean)', '');
		tempFeatureName = tempFeatureName.replace(' (Median)', '');
		tempFeatureName = tempFeatureName.replace(' (Variance)', '');
		tempFeatureName = tempFeatureName.replace(' (Max)', '');
		tempFeatureName = tempFeatureName.replace(' (Min)', '');
		tempFeatureName = tempFeatureName.replace(' Displayname', '');
		
		feature_breakdown[i]["tooltip"] = tooltips[tempFeatureName]
		
		//value
		feature_breakdown[i].value = features[Object.keys(features)[0]][i][1];
	
		//weight
		feature_breakdown[i].weight = features[Object.keys(features)[0]][i][2];
	}


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
			"body": JSON.stringify(commentData)
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

/** 
 * @param text {string}
 * @param context {object}
*/
const template_regex = /{{[\s\S]*}}/g
function render_template_comment(text, context) {
	var rendered = text.replace(template_regex,
		(match) => {
			let internal = match.substring(2, match.length-2).toLowerCase();
			if (check.isDefined(context[internal])) { return context[internal]; }
			return match;
	});

	return rendered;
}

function get_comment_data(config, context) {
	const comment = {
		"body": {
			"type": "doc",
			"version": 1,
			"content": [
				{ "type": "paragraph", 
				"content": [
					{
						"text": render_template_comment(config.auto_eval_comment, context),
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
	evaluation_lozange_set_from_data: evaluation_lozange_set_from_data,
	get_issue_and_linked: get_issue_and_linked,
	delay_evaluation_loop: delay_evaluation_loop
}