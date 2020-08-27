function on_load() {


	$.ajax(`/get-config-settings?jwt=${jwt_token}`, {
		"error": 
			function (xhr, textStatus, errorThrown) { 
				console.error(errorThrown); 
			},
		"success": 
			function(data) { 
				console.log(data); 
			}
	});

}

on_load();