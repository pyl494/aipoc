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
				const delayTimeCreateInput =  document.getElementById('automatic-evaluation-delay-create');
				const delayTimeUpdateInput =  document.getElementById('automatic-evaluation-delay-update');
				const riskLevelSelect = document.getElementById('automatic-evaluation-risk-level-comment');
				const commentTextInput = document.getElementById('automatic-evaluation-comment');
				const chkBoxUpdateResetDelay = document.getElementById('automatic-evaluation-update-reset-delay');

				chkBoxCreation.checked = config.auto_eval_enabled;
				chkBoxUpdated.checked = config.auto_eval_on_update;
				chkBoxUpdateResetDelay.checked = config.auto_eval_update_reset_delay;
				delayTimeCreateInput.value = config.auto_eval_delay_create;
				delayTimeUpdateInput.value = config.auto_eval_delay_update;
				riskLevelSelect.value = config.auto_eval_risk_level_warn;
				commentTextInput.value = config.auto_eval_comment;

				if (!chkBoxUpdated.checked) {
					chkBoxUpdateResetDelay.disabled = true;
				}
				
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
	const chkBoxResetDelay = document.getElementById('automatic-evaluation-update-reset-delay');
	const delayTimeCreateInput =  document.getElementById('automatic-evaluation-delay-create');
	const delayTimeUpdateInput =  document.getElementById('automatic-evaluation-delay-update');
	const riskLevelSelect = document.getElementById('automatic-evaluation-risk-level-comment');
	const commentTextInput = document.getElementById('automatic-evaluation-comment');

	var delayTimeCreate = clamp(delayTimeCreateInput.value, 0, 30);
	var delayTimeUpdate = clamp(delayTimeUpdateInput.value, 0,  30);

	var send = {
		"auto_eval_enabled": chkBoxCreation.checked,
		"auto_eval_on_update": chkBoxUpdated.checked,
		"auto_eval_delay_create": delayTimeCreate,
		"auto_eval_delay_update": delayTimeUpdate,
		"auto_eval_risk_level_warn": riskLevelSelect.value,
		"auto_eval_comment": commentTextInput.value,
		"auto_eval_update_reset_delay": chkBoxResetDelay.checked
	};

	console.log(send);

	var applyChangesSpinner = document.getElementById('apply-changes-spinner');

	applyChangesSpinner.style.display = 'inline-flex';

	$.post(`/set-config-settings?jwt=${jwt_token}`, send).done(function(data) { 
		console.log(data); 
		applyChangesSpinner.style.display = 'none';

	});
}

on_load();

var autoEvalUpdateChkBox = document.getElementById('automatic-evaluation-enabled-on-update');
autoEvalUpdateChkBox.addEventListener('click', () => {
	const chkBoxUpdateResetDelay = document.getElementById('automatic-evaluation-update-reset-delay');
	if (autoEvalUpdateChkBox.checked) {
		chkBoxUpdateResetDelay.disabled = false;
	}
	else if (!autoEvalUpdateChkBox.checked) {
		chkBoxUpdateResetDelay.disabled = true;
	}
});