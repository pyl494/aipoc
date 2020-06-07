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

    // This is an example route that's used by the default "generalPage" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/issue-glance-panel', addon.authenticate(), function (req, res) {
            res.render('issue-glance-panel', {
                title: 'Atlassian Connect'
                //issueId: req.query['issueId']
            });
        }
	);
	
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
