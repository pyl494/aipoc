import React, { Component } from 'react';
import Select from '@atlaskit/select';

const control_low_risk = (provided, state) => ({ 
	...provided,
	backgroundColor: 'rgb(0, 135, 90) !important',
	borderRadius: '6px', 
	color: state.isFocused  ? 'white' : 'black',
	'&:hover': {
		backgroundColor: 'rgb(0, 135, 90)'
	}
});

const control_med_risk = (provided, state) => ({
	...provided,
	backgroundColor: 'rgb(255, 139, 0) !important',
	borderRadius: '6px', 
	color: 'rgb(23, 43, 77)',
	'&:hover': {
		backgroundColor: 'rgb(255, 139, 0)'
	}
});

const control_high_risk = (provided, state) => ({
	...provided,
	"&:hover": {
		backgroundColor: 'rgb(222, 53, 11) !important' 
	},
	backgroundColor: 'rgb(222, 53, 11)',
	borderRadius: '6px', 
	color: 'white',
});


export default class EvaluationSelection extends Component {
	constructor(props) {
		super(props);
		var from_manual
		var control_style = control_low_risk;

		var _value = { label: "Evaluation: " + props.risk, value: 'risk-evader-eval' };

		if (props.manual != null && props.manual != "None") {
			switch (props.manual) {
				case 'low':
					_value = { label: 'Override: Low Risk', value: 'override-low' };
					control_style = control_low_risk;
					break;
				case 'medium':
					control_style = control_med_risk;
					_value = { label: 'Override: Medium Risk', value: 'override-medium' };
					break;
				case 'high':
					control_style = control_high_risk;
					_value = { label: 'Override: High Risk', value: 'override-high' };
					break;
			}

		}
		else {
			switch (props.risk) {
				case "Low Risk":
					control_style = control_low_risk;
					break;
				case "Medium Risk":
					control_style = control_med_risk;
					break;
				case "High Risk":
					control_style = control_high_risk;
					break;
			}
		}



		this.state = {
			webupdate: props.webupdate,
			value: _value,

			options: [
				{
	  				label: 'Machine Learning',
	 				 options: [
						{ label: "Evaluation: " + props.risk, value: 'risk-evader-eval' }
			  		],
				},
				{
			  		label: 'Manual Overrides',
			  		options: [
						{ label: 'Override: High Risk', value: 'override-high' },
						{ label: 'Override: Medium Risk', value: 'override-medium' },
						{ label: 'Override: Low Risk', value: 'override-low' },
						{ label: 'Don\'t Evaluate', value: 'override-no-eval' }
			  		],
				},
		  	],

		  	styling: {
		  		option: (provided, state) => ({
					...provided,
				}),
				control: control_style,
				singleValue: (provided, state) => ({
					color: 'white',
				}),
				menuList: (provided, state) => ({
					... provided,
				}),
				container: (provided, state) => ({
					...provided,
					color: state.isHovered ? 'white' : 'black',
				})
		  	},

		  	current_risk: props.risk,
		  	eval_risk: props.risk
		}


		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(value) {
		var handle = JSON.parse(JSON.stringify(value)); // This is to extract the object.
		var panel = this;

		var crisk = "low";

		switch (this.state.eval_risk) {
			case 'Low Risk': crisk = 'low'; break;
			case 'Medium Risk': crisk = 'medium'; break;
			case 'High Risk': crisk = 'high'; break;
		}

		console.log(handle.value.value);
		switch (handle.value.value) {
			case 'risk-evader-eval':
				console.log(this.state.current_risk);
				if (this.state.current_risk == "Low Risk") { 
					this.state.styling.control = control_low_risk; 
					this.props.webupdate("rgb(0, 135, 90)");
				}
				else if (this.state.current_risk == "Medium Risk") { 
					this.state.styling.control = control_med_risk;
					this.props.webupdate("rgb(255, 139, 0)");	

				 }
				else if (this.state.current_risk == "High Risk") { 
					this.state.styling.control == control_high_risk;
					this.props.webupdate("rgb(222, 53, 11)");	

				}
				this.setState(value);
				break;
			case 'override-high':
				this.state.styling.control = control_high_risk;
				this.props.webupdate("rgb(222, 53, 11)");
				break;
			case 'override-medium':
				this.state.styling.control = control_med_risk;
				this.props.webupdate("rgb(255, 139, 0)");	
				break;
			case 'override-low':
				this.state.styling.control = control_low_risk;
				this.props.webupdate("rgb(0, 135, 90)");	
				break;
		}
		
		$.ajax("/set-issue-evaluation-setting?jwt=" + jwt_token + "&change_request=" + get("issueKey") + "&label=" + handle.value.value + "&risk=" + crisk, {
			"error": function (xhr, textStatus, errorThrown) {

			},
			"success": function (data) {
				console.log(data);
				panel.setState( {msg: data} );
			}
		});

		this.setState(value);
	}
	

	render() {
		return (
			<Select isMulti={false} options={this.state.options} value={this.state.value} onChange={value => this.handleChange({ value })} styles={this.state.styling} />
		)
	}
}