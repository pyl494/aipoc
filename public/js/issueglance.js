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

	var issuekey = get('issueKey');
	var appkey = "risk-evader-app"; // Set this to the app key.
	var modulekey = "my-issue-glance";

	var constr_url = `/set-issue-property-lozange?jwt=${jwt_token}&issueKey=${encodeURI(issuekey)}&ltext=${ltext}&ltype=${(ltype)}`

	console.log(constr_url);

	$.ajax(constr_url, {
		"error": function (xhr, textStatus, errorThrown) { console.error(errorThrown); },
		"success": function(data) { console.log(data); }
	});
}

function render_from_status(result) {
	console.log("render_from_status");
	console.log(result);
	addon.render();
}

function get_evaulation_and_render( ) {
	var issuekey = get('issueKey');

	var constructed_url = `/get-issue-evaluation?jwt=${jwt_token}&issueKey=${encodeURI(issuekey)}`
	console.log("constructed url: " + constructed_url);

	$.ajax(constructed_url, {
		"dataType": "json",
		"error": function (xhr, textStatus, errorThrown) {
			 console.error(errorThrown); 
			 resultObject = { "status" : "error" }

			 addon.render();
		},
		"success": function(data) {
			 console.log(data); 


			 resultObject = data;
			 features = data.features;

			 addon.render();

		}
	});

}
