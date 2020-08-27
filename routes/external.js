"use strict";

// modules
const axios = require('axios');
const moment = require('moment');
const SQL = require ('sql-template-strings');

// base 
const fs = require('fs');
const path = require('path');

// written code
const dbmanage = require('../dbmanage.js');
var issuequeue = require('../issuequeue.js')
const evaluation_functions = require('../evaluation.js');
const util = require('../util.js');
const dbutil = require('../dbutil.js');

const default_client_settings = require('../default_client_config.json');

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

app.get('/configure', addon.authenticate(), async function(req, res) {
	res.render('configure', { });
});

app.get('/get-config-settings', addon.authenticate(), async function(req, res) {
	console.log(req.context.clientKey);

	const db_client_config = dbutil.selectOne(SQL`
		SELECT * FROM userconfig
		WHERE clientKey = ${req.context.clientKey};
	`);

	const client_config = db_client_config.found ? db_client_config.result : default_client_settings;

	res.send(JSON.stringify(client_config));
});

app.post('/webhook-issue-created', addon.authenticate(), async function(req, res) {
    console.log('webhook-issue-created fired!');
	
	const issue = req.body.issue;

	// Filter out non-change request issues.
	if (!issue.fields.issuetype.name.toLowerCase().includes('change')) { return; }

    // Have we received a webhook response for this issue before.
	// This is to stop duplicate webhook responses.
    const has_issue_hooked = await dbmanage.is_in_webhook_history(issue.self);

    if (has_issue_hooked) { return; }
	dbmanage.insert_into_his(issue.self, issue.key);

	const db_client_config = dbutil.selectOne(SQL`
		SELECT * FROM userconfig
		WHERE clientKey = ${req.context.clientKey};
	`);

	const client_config = db_client_config.found ? db_client_config.result : default_client_settings;

	if (!client_config.auto_eval_enabled) { return; }


    // Time calculation
    var current_time = moment();
	var timewait = current_time.valueOf();
    current_time.add(client_config.auto_eval_delay, 'm');
    var ctimestamp = current_time.valueOf();
    var timewait = ctimestamp - timewait;

    // Insert into the Queue
    dbmanage.insert_into_queue(issue.self, issue.key, req.context.clientKey, ctimestamp);
    
    // Incase we have to clear it for whatever reason.
    issuequeue[issue.self] = setTimeout(
		evaluation_functions.delayed_evaluation
		, timewait, issue, req.context.clientKey, addon
	);


});

app.get('/set-issue-property-lozange', addon.authenticate(), function(req, res) {

    var issueKey = req.param('issueKey');
    var ltext = req.param('ltext');
    var ltype = req.param('ltype');

    var appkey = "risk-evader-app-cain";
    var modulekey = "my-issue-glance";


    var construct_url = `/rest/api/3/issue/${issueKey}/properties/com.atlassian.jira.issue:${appkey}:${modulekey}:status`;

    var loz_obj = `{ "type": "lozenge", "value": { "label": "${ltext}", "type": "${ltype}" } }`;


    var httpClient = addon.httpClient(req);

    httpClient.put({
            "headers": {
                "Content-Type": "application/json"
            },
            "url": construct_url,
            "body": loz_obj
        },
        function(err, response, body) {
            if (err) { 
            console.log(response.statusCode + ": " + err);
            res.send("Error: " + response.statusCode + ": " + err);
            }
            else {
                console.log(response.statusCode, body);
                res.send(body);
            }
        }
    );
});

app.get('/get-issue-evaluation', addon.authenticate(), async function(req, res) {

	var issue_key = req.query.issueKey;

	var issues = await util.get_issue_and_linked(app, addon, req, res, issue_key);
	issues = issues.issues;
	var last_updated = await evaluation_functions.get_last_updated(issues);

	console.log(last_updated);
	
	const add_resp = await axios({
		method: 'post',
		url: 'http://localhost:8080/micro?type=add',
		headers: {},
		data: {
			issues: issues
		}
	});

	const hs_resp = await axios.post(`http://localhost:8080/micro?type=handshake&change_request=${issue_key}&updated=${last_updated}`) 

	var features = await evaluation_functions.get_feature_breakdown(hs_resp.data.features);

	var prediction_data = hs_resp.data.predictions;

	if ((hs_resp.data.manual == null || hs_resp.data.manual == 'None') && prediction_data !== null && typeof(prediction_data) !== 'undefined' && prediction_data != '') {
		try {
			evaluation_functions.evaluation_lozange_set_from_data(addon, req.context.clientKey, prediction_data, issue_key);
		}
		catch (err) {
			console.error(err);
		}
	}

	var to_send = {
		features : features,
		predictions : hs_resp.data.predictions,
		all : hs_resp.data
	}

	res.send(JSON.stringify(to_send));
});



app.get('/issue-glance-panel', addon.authenticate(), function (req, res) {
    res.render('issue-glance-panel', { }); // Just gives it the page.
});

app.get('/set-issue-evaluation-setting', addon.authenticate(), function(req, res) {


    var override_label = req.query.label;
    var change_request = req.query.change_request;
    var eval_risk = req.query.risk;

    console.log(`override_label: ${override_label}  change_request: ${change_request}`);

    var label = 'None';
    if (override_label == 'override-high') { label = 'high'; }
    else if (override_label == 'override-medium') { label = 'medium'; }
    else if (override_label == 'override-low') { label = 'low'; }
    else if (override_label == 'override-no-eval') { label = 'None'; }
    else if (override_label == 'risk-evader-eval') { label = 'None'; }
    else { var result = { status: "error", reason: "Unknown label: " + override_label }; res.send(JSON.stringify(result)); return; }

    var t_URL = `http://localhost:8080/micro?type=override&change_request=${change_request}&label=${label}`;

    axios.post(t_URL, {
    }).then((resp) => {
        var result = { status: '', reason: '' };
        if (resp.data.result == 'Not Found') {
            result.status = 'error';
            result.reason = `${issue_key} not found in ${project}`;
            res.send(JSON.stringify(result));
            return;
        }
    }).catch((error) => {
        var result = { status: 'error', reason: 'Backend error.' };
        console.error(error)
        res.send(JSON.stringify(result));

    }).finally(() => {
        result = { status: 'ok' };
        switch (override_label) {
            case 'override-high':
                util.set_issue_lozange(app, addon, req, res, change_request, 'Override: High Risk', "removed");
                break;
            case 'override-medium':
                util.set_issue_lozange(app, addon, req, res, change_request, 'Override: Medium Risk', "moved");
                break;
            case 'override-low':
                util.set_issue_lozange(app, addon, req, res, change_request, 'Override: Low Risk', "success");
                break;
            case 'risk-evader-eval':
                if (eval_risk == 'low') {
                    util.set_issue_lozange(app, addon, req, res, change_request, 'Low Risk', "success");
                }
                else if (eval_risk == 'medium') {
                    util.set_issue_lozange(app, addon, req, res, change_request, 'Medium Risk', "moved");
                }
                else if (eval_risk == 'high') {
                    util.set_issue_lozange(app, addon, req, res, change_request, 'High Risk', "removed");
                }
                break;
        }

        res.send(JSON.stringify(result))
    });
    
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
    var files = fs.readdirSync("routes");
    for(var index in files) {
        var file = files[index];
        if (file === "index.js" || file === "external.js") continue;
        // skip non-javascript files
        if (path.extname(file) != ".js") continue;

        var routes = require("./" + path.basename(file));

        if (typeof routes === "function") {
            routes(app, addon);
        }
    }
}
