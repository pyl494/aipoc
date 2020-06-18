

export async function get_linked_issue_data(app, addon, req, res, issueKey) {
	var issue_link_data = [];
	var httpClient = addon.httpClient(req);
	await new Promise((resolve, reject) => { 
		httpClient.get({
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			"url": "/rest/api/3/issue/" + issueKey
		},
		function(err, response, body) {
			if (err) { 
				console.log(response.statusCode + ": " + err);
				res.send("Error: " + response.statusCode + ": " + err);
				resolve();
			}
			else {
				var issueObject = JSON.parse(body);
				for(let i = 0; i < issueObject.fields.issuelinks.length; i++) {
					var inwardIssue = issueObject.fields.issuelinks[i].inwardIssue;
					linked_issues.push(inwardIssue);
				}
				resolve();

			}
		});
	});
	return issue_link_data;
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
			"url": "/rest/api/3/search?jql=project" + encodeURI(" = " + project_key) + "&maxResults=999999"
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