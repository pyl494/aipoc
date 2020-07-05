function get_stored_status(callback) {
	console.log("get_stored_status - start");

	var result = { status: 'None' }
	var issuekey = get('issueKey'); // get the issuekey
	var propkey = 'riskevader.stored'

	AP.request(`/rest/api/3/issue/${issuekey}/properties/${propkey}`, {
		error: function(xhr, statusText, errorThrown) {
			addon.render();
		},
		success: function(responseText) {
			result.status = 'Ok';
			result.object = JSON.parse(responseText);
			return callback(result);
		}
	});
}

function set_stored_status(status, callback) {

	var issuekey = get('issueKey'); // get the issuekey
	var propkey = 'riskevader.stored'

	var status_text = "";

	if (typeof(status) != "string") {
		status_text = JSON.Stringify(status); // Give me an object and i'll stringify it.
	}
	else { status_text = status; } // GIVE ME A STRING AND PRAY THAT YOU'VE FORMATTED THIS CORRECTLY.


	AP.request(
		{
			url: `/rest/api/3/issue/${issuekey}/properties/${propkey}`,
			type: 'PUT',
			body: status_text
		}, {
		error: function(xhr, statusText, errorThrown) {
			return console.error(errorThrown);
		},
		success: function(responseText) {
			return callback();
		}
	});


}

function set_lozange(ltext, ltype) {

	var issuekey = get('issuekey');
	var appkey = "risk-evader-app";
	var modulekey = "my-issue-glance";

	var constr_url = `/rest/api/3/issue/${issuekey}/properties/com.atlassian.jira.issue:${appkey}:${modulekey}:status`;

	var loz_obj = `{ "type": "lozenge", "value": { "label": "${ltext}", "type": "${ltype}" } }`;

	AP.request(
		{
			url: constr_url,
			type: 'PUT',
			body: loz_obj
		}, {
		error: function(xhr, statusText, errorThrown) {
		},
		success: function(responseText) {
		}
	});

}

function render_from_status(result) {
	console.log("render_from_status");
	console.log(result);
	addon.render();
}

