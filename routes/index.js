var util = require('util');

module.exports = function(app, addon) {
  
    app.get('/', function(req, res) {
        res.format({
            'text/html': function() {
                res.redirect('/atlassian-connect.json');
            },
            'application/json': function() {
                res.redirect('/atlassian-connect.json');
            }
        });
      }

    );

    app.get('/hello-world', addon.authenticate(), function(req, res) {
        res.render('hello-world', {
            title: 'Atlassian Connect'
        });
    });

    app.get('/issue-glance-panel', addon.authenticate(), function(req, res) {
        res.render('issue-glance-panel', {
            title: "Change Risk Assessment"
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

    app.get('/jira-issues', addon.authenticate(), function(req, res) {
        res.render('jira-issues', {
            title: 'Jira Issues'
        });
    });

    app.get('/jira-issues-changelog', addon.authenticate(), function(req, res) {
        res.render('jira-issues-changelog', {
            title: 'Jira Issues Changelog'
        });
    });

    app.get('/jira-issues-worklogs', addon.authenticate(), function(req, res) {
        res.render('jira-issues-worklogs', {
            title: 'Jira Issues Worklogs'
        });
    });

    app.get('/jira-projects', addon.authenticate(), function(req, res) {
        res.render('jira-projects', {
            title: 'Jira Projects'
        });
    });
    app.get('/jira-projects-properties', addon.authenticate(), function(req, res) {
        res.render('jira-projects-properties', {
            title: 'Jira Projects Properties'
        });
    });

    app.get('/configure', addon.authenticate(), function(req, res) {
        res.render('configure', {
            title: 'Atlassian Connect'
        });
    });

    app.get('/profile-tab', addon.authenticate(), function(req, res) {
        res.render('profile-tab', {
            userKey: req.param('profileUserKey'),
            userName: req.param('profileUserName')
        });
    });

    app.get('/search-view', addon.authenticate(), function(req, res) {
        res.render('search-view', {
            userKey: req.param('user_key'),
            userName: req.param('user_id'),
            lic: req.param('lic'),
            loc: req.param('loc'),
            tz: req.param('tz'),
            link: req.param('link'),
            startIssue: req.param('startIssue'),
            endIssue: req.param('endIssue'),
            totalIssues: req.param('totalIssues'),
            issues: req.param('issues')
        });
    });

    app.post('/created', function(req, res) {
        var issueKey = req.body.issue.key;
        var summary  = req.body.issue.fields.summary;
        var type     = req.body.issue.fields.issuetype.name;
        console.log("Issue created", issueKey, summary, type);
        res.send(200);
    });

    app.get('/addonData', addon.checkValidToken(), function(req, res) {
      var httpClient = addon.httpClient(req);

      httpClient.get({
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            "url": "/rest/atlassian-connect/latest/addons/" + addon.key
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
};