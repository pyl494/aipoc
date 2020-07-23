import React, { Component } from 'react';
import Select from '@atlaskit/select';

const control_low_risk = (provided, state) => ({ 
	...provided,
	backgroundColor: 'rgb(0, 135, 90)',
	borderRadius: '6px', 
	color: state.isFocused  ? 'white' : 'black',
});

const control_med_risk = (provided, state) => ({
	...provided,
	backgroundColor: 'rgb(255, 139, 0)',
	borderRadius: '6px', 
	color: 'rgb(23, 43, 77)'
});

const control_high_risk = (provided, state) => ({
	...provided,
	backgroundColor: 'rgb(222, 53, 11)',
	borderRadius: '6px', 
	color: 'white'
});


export default class EvaluationSelection extends Component {
	constructor(props) {
		super(props);

		var control_style = control_low_risk;

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


		this.state = {
			value: { label: "Evaluation: " + props.risk, value: 'risk-evader-eval' },

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

		  	current_risk: props.risk
		}


		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(value) {
		var handle = JSON.parse(JSON.stringify(value)); // This is to extract the object.
		var panel = this;
		console.log(handle.value.value);
		switch (handle.value.value) {
			case 'risk-evader-eval':
				console.log(this.state.current_risk);
				if (this.state.current_risk == "Low Risk") { this.state.styling.control = control_low_risk; }
				else if (this.state.current_risk == "Medium Risk") { this.state.styling.control = control_med_risk; }
				else if (this.state.current_risk == "High Risk") { this.state.styling.control == control_high_risk; }
				this.setState(value);
				return;
			case 'override-high':
				this.state.styling.control = control_high_risk;
				break;
			case 'override-medium':
				this.state.styling.control = control_med_risk;
				break;
			case 'override-low':
				this.state.styling.control = control_low_risk;
				break;
		}
		
		$.ajax("/set-issue-evaluation-setting?jwt=" + jwt_token + "&change_request=" + get("issueKey") + "&label=" + handle.value.value, {
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