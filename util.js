export async function get_issue_and_linked(app, addon, req, res, issueKey) {
	var issue_and_linked = [];

	var httpClient = addon.httpClient(req);

	console.log("/rest/api/3/search?jql=" + encodeURI(`issueKey = ${issueKey} OR issue in linkedIssues(${issueKey})`) + "&maxResults=999999&fields=*all&expand=names,changelog");

	await new Promise((resolve, reject) => {
		httpClient.get({
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			"url": "/rest/api/3/search?jql=" + encodeURI(`issueKey=${issueKey} OR issue in linkedIssues(${issueKey})`) + "&maxResults=999999&fields=*all&expand=names,changelog"
		},
		function(err, response, body) {
			if (err) {
				console.log(response.statusCode + ": " + err);
				res.send("Error: " + response.statusCode + ": " + err);
				resolve();
			}
			else {
				issue_and_linked = JSON.parse(body);
				resolve();
			}
		});
	}).catch((error) => {
		console.error(err);
	});

	return issue_and_linked;

}


export async function get_all_issues_project(app, addon, req, res, project_key) {

	var issues = [];
	var httpClient = addon.httpClient(req);
	await new Promise((resolve, reject) => {
		httpClient.get({
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			"url": "/rest/api/3/search?jql=project" + encodeURI(" = " + project_key) + "&maxResults=999999&fields=*all&expand=names,changelog"
		},
		function(err, response, body) {
			if (err) {
				console.log(response.statusCode + ": " + err);
				res.send("Error: " + response.statusCode + ": " + err);
				resolve();
			}
			else {
				var bodyObject = JSON.parse(body);
				issues = bodyObject.issues;
				resolve();

			}
		});
	}).catch((error) => {
		console.error(error);
	});
	return issues;

}

export async function set_issue_lozange(addon, clientKey, issue_key, ltext, ltype) {

	var modulekey = "my-issue-glance";

	var construct_url = `/rest/api/3/issue/${issue_key}/properties/com.atlassian.jira.issue:${addon.key}:${modulekey}:status`;

    var loz_obj = `{ "type": "lozenge", "value": { "label": "${ltext}", "type": "${ltype}" } }`;


    var httpClient = addon.httpClient({
		clientKey: clientKey
	});

    httpClient.put({
            "headers": {
                "Content-Type": "application/json"
            },
            "url": construct_url,
            "body": loz_obj
        },
        function(err, response, body) {
        }
    );

}

export function clamp (num, min, max) {
	if (num < min) {
		return min;
	}
	if (num > max) {
		return max;
	}
	return num;
}
