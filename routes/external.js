"use strict";

const axios = require('axios');
const util = require('../util.js');

const fs = require('fs');
const path = require('path');

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
    var issue_key = req.query.issueKey;
    var linked_issues = [];
	var evaluation_setting = 'def-no-eval';
    
    /*
    Todo:
    Handshake process should go like this:
    1) Send data explorer /handshake. 
    2) If data explorer responds with 'Not found' or 'Not Up To Date', then do /add
    3) Send data explorer /handshake
    4) Get response/predictions
    */
	
    util.get_issue_and_linked(app, addon, req, res, issue_key).then((issues_resp) => {
        var issues = issues_resp.issues;
        

        // TODO: CONVERT THESE INTO DATE OBJECTS SO THEY CAN BE COMPARED
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
		
		axios({
            method: 'post',
            url: 'http://localhost:8080/micro?type=add',
            headers: {},
            data: {
                issues: issues
            }
            
        }).then((() => {
            //make handshake
            return axios.post(`http://localhost:8080/micro?type=handshake&change_request=${issue_key}&updated=${last_updated}`, {})  
        })).then(hs_resp => {
            console.log(hs_resp.data)
            res.render('issue-glance-panel', {
                title: 'Atlassian Connect',
                assignee_stats: JSON.stringify(assignee_stats),
                evaluation_setting: evaluation_setting,
                predictions: JSON.stringify(hs_resp.data.predictions),
                features: JSON.stringify(hs_resp.data.features)
            })
        })



    });


    //util async function to get all issues from a project
    // util.get_all_issues_project(app, addon, req, res, req.query.project).then((issues_resp) => {
    //     for (var i = 0; i < issues_resp.length; i++) {
    //         issues_resp[i].fields.fixVersions = [ { name: "1.2.3"} ];
    //     }
    //     //axois post to add issue
    //     axios({
    //         method: 'post',
    //         url: 'http://localhost:8080/micro?type=add',
    //         headers: {},
    //         data: {
    //             issues: issues_resp
    //         }

    //     }).then((() => {
    //         //make handshake
    //         return axios.post(`http://localhost:8080/micro?type=handshake&project=${project}&version=1.2.3`, {})  
    //     })).then(hs_resp => {
    //         console.log(hs_resp.data.predictions)
    //         res.render('issue-glance-panel', {
    //             title: 'Atlassian Connect',
    //             assignee_stats: JSON.stringify(assignee_stats),
    //             evaluation_setting: evaluation_setting,
    //             predictions: JSON.stringify(hs_resp.data.predictions)
    //         })
    //     })
    // })
});

app.get('/set-issue-evaluation-setting', addon.authenticate(), function(req, res) {
    var eval_set = req.query.type;
    var issue_key = req.query.issueKey;
    var project = req.query.project;

    var label = 'None';
    if (eval_set == 'override-high') { label = 'high'; }
    else if (eval_set == 'override-medium') { label = 'medium'; }
    else if (eval_set == 'override-low') { label = 'low'; }
    else if (eval_set == 'override-no-eval') { label = 'None'; }
    else { var result = { status: "ok" }; res.send(JSON.stringify(result)); return; }

    var t_URL = `http://localhost:8080/micro?type=override&change_request=${issue_key}&label=${label}`;

    axios.post(t_URL, {
    }).then((resp) => {
        var result = { status: '', reason: '' };
        if (resp.data.result == 'Not Found') {
            result.status = 'error';
            result.reason = `${issue_key} not found in ${project}`;
            res.send(JSON.stringify(result));
            return;
        }
        else {

        }
    }).catch((error) => {
        var result = { status: 'error', reason: 'Backend error.' };
        console.error(error)
        res.send(JSON.stringify(result));

    }).finally(() => {


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
