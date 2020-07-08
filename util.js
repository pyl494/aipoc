

export async function get_issue_and_linked(app, addon, req, res, issueKey) {
	var issue_and_linked = [];

	var httpClient = addon.httpClient(req);

	console.log("/rest/api/3/search?jql=" + encodeURI(`issueKey = ${issueKey} OR issue in linkedIssues(${issueKey})`) + "&maxResults=999999&fields=*all&expand=names");

	await new Promise((resolve, reject) => { 
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
				resolve();
			}
			else {
				issue_and_linked = JSON.parse(body);
				resolve();
			}
		});
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
			"url": "/rest/api/3/search?jql=project" + encodeURI(" = " + project_key) + "&maxResults=999999&fields=*all&expand=names"
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
	});
	return issues;

}