

export async function get_issue_and_linked(app, addon, req, res, issueKey) {
	var issue_and_linked = [];

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
				var issue_object = JSON.parse(body);
				result.main = issue_object;
				issue_and_linked.push(issue_object);

			}
		});
	}).then(() => {
		new Promise((resolve, reject) => { 
			httpClient.get({
				"headers": {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				"url": "/rest/api/3/search?jql=" + encodeURI(`issue in linkedIssues(${issueKey})`)
			},
			function(err, response, body) {
				if (err) { 
					console.log(response.statusCode + ": " + err);
					res.send("Error: " + response.statusCode + ": " + err);
					resolve();
				}
				else {
					var issues = JSON.parse(body);

					for (var i = 0; i != issues.length; i++) {
						issue_and_linked.push(issues[i]);
					}
					resolve();

				}
			});
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