const axios = require('axios');
const moment = require('moment');
const dbutil = require('../dbutil.js');
const util = require('./util.js')
const dbmanage = require('../dbmanage.js');
var issuequeue = require('../issuequeue.js')

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
				console.log(response.statusCode + ": " + err);
				res.send("Error: " + response.statusCode + ": " + err);
				resolve(err);
			}
			else {
				console.log("Body" + body);
				issue_and_linked = JSON.parse(body);
				resolve(body);
			}
		});
	});

	var issues = issue_and_linked.issues;
	
	return issues;
}

async function delayed_evaluation(issue, clientKey, addon) {
	var issueKey = issue.key;
	var issueSelf = issue.self;

	dbmanage.remove_from_queue(issueSelf);

	var issues = await get_issue_and_linked(issueLey, clientKey, addon);

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

	var handshake_features = axios_hs_resp.features;
	var features = await get_feature_breakdown(handshake_features);
	var prediction_data = axios_hs_resp.data.predictions;

	if (
		(axios_hs_resp.data.manual == null || axios_hs_resp.data.manual == 'None') 
		&& prediction_data !== null
		&& typeof(prediction_data) !== 'undefined' 
		&& prediction_data != ''
	) {
		evaluation_lozange_set(addon, clientKey, prediction_data, issueKey);
	}


}

async function get_evaluation(issue) {

}

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

async function get_feature_breakdown(features) {

	var feature_breakdown = [];

	for(var i = 0; i<5; i++) {

		feature_breakdown[i] = {
			name: "name",
			value: "0",
			weight: "0"
		}

		//name
		feature_breakdown[i]["name"] = features[Object.keys(features)[0]][i][0];

		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace('number_of', '');

		/*
		
		features[i]["name"] = features[i]["name"].replace('name', '');
		features[i]["name"] = features[i]["name"].replace('sum', '');
		features[i]["name"] = features[i]["name"].replace('stdev', '');
		features[i]["name"] = features[i]["name"].replace('mean', '');
		*/

		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(/_/g, ' ');
		feature_breakdown[i]["name"] = feature_breakdown[i]["name"].replace(
			/\w\S*/g,
			function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
		feature_breakdown[i].value = features[Object.keys(features)[0]][i][1];
	
		//weight
		feature_breakdown[i].weight = features[Object.keys(features)[0]][i][2];
	}

	return feature_breakdown;
}

async function evaluation_lozange_set(addon, clientKey, prediction_data, issue_key) {

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

module.exports = {
	delayed_evaluation: delayed_evaluation
}