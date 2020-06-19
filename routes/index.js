const axios = require('axios');
const util = require('../util.js');

module.exports = function (app, addon) {

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
	});
	
	app.get('/issue-glance-test', function(req, res) {
		var assignee_stats = [
			{ assignee: 'bob29', issuenum: 3, delays: 12 },
			{ assignee: 'hd125', issuenum: 6, delays: 1 },
			{ assignee: 'steve', issuenum: 4, delays: 0 }
		];

		
		res.render('issue-glance-panel', {
			title: 'Atlassian Connect',
			assignee_stats: JSON.stringify(assignee_stats)

			//issueId: req.query['issueId']

		});
	});


    // This is an example route that's used by the default "generalPage" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/issue-glance-panel', addon.authenticate(), function (req, res) {

		var assignee_stats = [
			{ assignee: 'bob29', issuenum: 3, delays: 12 },
			{ assignee: 'hd125', issuenum: 6, delays: 1 },
			{ assignee: 'steve', issuenum: 4, delays: 0 }
		];

		//var data = util.get_all_issues_project(app, addon, req, res, req.query.project);
		var project = req.query.project;
		var issue_id = req.query.issue;
		var linked_issues = [];
		var evaluation_setting = 'def-no-eval';



		//util async function to get all issues from a project
		util.get_all_issues_project(app, addon, req, res, req.query.project).then((issues_resp) => {

			for (var i = 0; i < issues_resp.length; i++) {
				issues_resp[i].fields.fixVersions = [ { name: "1.2.3"} ];
			}

			//axois post to add issue
			axios({
				method: 'post',
				url: 'http://localhost:8080/micro?type=add',
				headers: {},
				data: {
					issues: issues_resp
				}

			}).then((add_resp => {
				//make handshake
				return axios.post(`http://localhost:8080/micro?type=handshake&project=${project}&version=1.2.3`, {})
			})).then((hs_resp) => {
				//do something with response
			}).finally(() => {
				res.render('issue-glance-panel', {
					title: 'Atlassian Connect',
					assignee_stats: JSON.stringify(assignee_stats),
					evaluation_setting: evaluation_setting
				});
			})
		})

		
		/*
		var t_URL = `http://localhost:8080/micro?type=handshake&project=${project}&version=1.2.3`;
		var issue_status = {
			status: ""
		}
		var evaluation_setting = 'def-no-eval';


		axios.post(t_URL, {
		}).then((resp) => {

			console.log(resp.data)
			console.log("repsonse got")
			console.log(resp)

		}).catch((error) => {

			console.error(error)


		}).finally(() => {
			// Render the page with hopefully any data that is necessary.
			
			res.render('issue-glance-panel', {
				title: 'Atlassian Connect',
				assignee_stats: JSON.stringify(assignee_stats),
				evaluation_setting: evaluation_setting
				//issueId: req.query['issueId']

			});


		})
		*/


	});

	app.get('/set-issue-evaluation-setting', addon.authenticate(), function(req, res) {
		var eval_set = req.query.type;
		var issueid = req.query.issueid;
		var project = req.query.project;

		var label = 'None';
		if (eval_set == 'override-high') { label = 'high'; }
		else if (eval_set == 'override-medium') { label = 'medium'; }
		else if (eval_set == 'override-low') { label = 'low'; }
		else if (eval_set == 'override-no-eval') { label = 'None'; }
		else { var result = { status: "ok" }; res.send(JSON.stringify(result)); return; }

		var t_URL = `http://localhost:8080/micro?type=override&project=${project}&version=1.2.3&label=${label}`;

		axios.post(t_URL, {
		}).then((resp) => {
			var result = { status: '', reason: '' };
			if (resp.body.result == 'Not Found') {
				result.status = 'error';
				result.reason = `${issueid} not found in ${project}`;
				res.send(JSON.stringify(result));
				return;
			}



		}).catch((error) => {
			var result = { status: 'error', reason: 'Backend error.' };
			console.error(error)
			res.send(JSON.stringify(result));

		}).finally(() => {


		})


		
	});
	
	app.get('/get-issue-data', addon.authenticate(), function(req, res) {
        //'/rest/api/3/issue/{issueIdOrKey}'
        var issueKey = req.param('issueKey');
        var httpClient = addon.httpClient(req);

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
                }
                else {
                    
                    // Process stuff.
                    
                    var jsonData = body;
                    var issueObject = JSON.parse(jsonData);
                    var sendObject = { };

                    sendObject.id = issueObject.id;
                    sendObject.name = issueObject.fields.summary;
                    sendObject.projectName = issueObject.fields.project.name;
                    sendObject.issueTypeName = issueObject.fields.issuetype.name;
                    sendObject.linked = [];
                    sendObject.riskFactor = Math.abs(-5 + issueObject.fields.issuelinks.length); // Higher = worses

                    for(let i = 0; i < issueObject.fields.issuelinks.length; i++) {

                        var inwardIssue = issueObject.fields.issuelinks[i].inwardIssue;

                        var linkedData = { };
                        linkedData.id = inwardIssue.id;
                        linkedData.name = inwardIssue.fields.summary;

                        sendObject.linked.push(linkedData);
                    }

                    console.log(sendObject);


                    res.send(JSON.stringify(sendObject));
                }
            }
        );
    });

    // Add any additional route handlers you need for views or REST resources here...


    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for(var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};
