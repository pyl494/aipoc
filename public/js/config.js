function on_load() {


	$.ajax(`/get-config-settings?jwt=${jwt_token}`, {
		"error": 
			function (xhr, textStatus, errorThrown) { 
				console.error(errorThrown); 
			},
		"success": 
			function(data) { 
				const config = JSON.parse(data);

				const chkBoxCreation = document.getElementById('automatic-evaluation-enabled-on-creation');
				const chkBoxUpdated = document.getElementById('automatic-evaluation-enabled-on-update');
				const delayTimeInput =  document.getElementById('automatic-evaluation-delay');
				const riskLevelSelect = document.getElementById('automatic-evaluation-risk-level-comment');
				const commentTextInput = document.getElementById('automatic-evaluation-comment');

				chkBoxCreation.checked = config.auto_eval_enabled;
				chkBoxUpdated.checked = config.auto_eval_on_update;
				delayTimeInput.value = config.auto_eval_delay;
				riskLevelSelect.value = config.auto_eval_risk_level_warn;
				commentTextInput.value = config.auto_eval_comment;
			}
	});

}

function clamp (num, min, max) {
	if (num < min) {
		return min;
	}
	if (num > max) {
		return max;
	}
	return num;
}

function apply_changes() {

	const chkBoxCreation = document.getElementById('automatic-evaluation-enabled-on-creation');
	const chkBoxUpdated = document.getElementById('automatic-evaluation-enabled-on-update');
	const delayTimeInput =  document.getElementById('automatic-evaluation-delay');
	const riskLevelSelect = document.getElementById('automatic-evaluation-risk-level-comment');
	const commentTextInput = document.getElementById('automatic-evaluation-comment');

	var delayTime = clamp(delayTimeInput.value, 0, 30);

	var send = {
		"auto_eval_enabled": chkBoxCreation.checked,
		"auto_eval_on_update": chkBoxUpdated.checked,
		"auto_eval_delay": delayTime,
		"auto_eval_risk_level_warn": riskLevelSelect.value,
		"auto_eval_comment": commentTextInput.value
	};

	console.log(send);


	$.post(`/set-config-settings?jwt=${jwt_token}`, send ,{
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