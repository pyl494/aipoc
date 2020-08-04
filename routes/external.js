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

app.post('/webhook-issue-created', addon.authenticate(), function(req, res) {
    console.log('webhook-issue-created fired!');
    console.log(req.body.issue);
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

app.get('/get-issue-evaluation', addon.authenticate(), function(req, res) {

    var issue_key = req.query.issueKey;
    var linked_issues = [];
    var evaluation_setting = 'def-no-eval';

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


            console.log(hs_resp.data.features[Object.keys(hs_resp.data.features)[0]][0])

            var features = [];

            for(var i = 0; i<5; i++){

                features[i] = {
                    name: "name",
                    value: "0",
                    weight: "0"
                }

                //name
                features[i]["name"] = hs_resp.data.features[Object.keys(hs_resp.data.features)[0]][i][0];

                features[i]["name"] = features[i]["name"].replace('number', '#');
                features[i]["name"] = features[i]["name"].replace(/_/g, ' ');
                features[i]["name"] = features[i]["name"].replace(
                    /\w\S*/g,
                    function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    }
                );

                //value
                features[i].value = hs_resp.data.features[Object.keys(hs_resp.data.features)[0]][i][1];
            
                //weight
                features[i].weight = hs_resp.data.features[Object.keys(hs_resp.data.features)[0]][i][2];
            }

            var prediction_data = hs_resp.data.predictions;

            console.log(features);

            if ((hs_resp.data.manual == null || hs_resp.data.manual == 'None') && prediction_data !== null && typeof(prediction_data) !== 'undefined' && prediction_data != '') {
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
                util.set_issue_lozange(app, addon, req, res, issue_key, risk_set, lozenge_set);

            }

            var to_send = {
                features : features,
                predictions : hs_resp.data.predictions,
                all : hs_resp.data
            }
            console.log(to_send);

            res.send(JSON.stringify(to_send));
        })

    });
    

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
