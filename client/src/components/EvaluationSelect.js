import React, { Component } from 'react';
import Select from '@atlaskit/select';

const GROUP_OPTIONS = [
	{
	  label: 'Machine Learning',
	  options: [
		{ label: 'Use RiskEvader Evaluation', value: 'risk-evader-eval' },
		{ label: 'No Current Evaluation', value: 'def-no-eval' }
	  ],
	},
	{
	  label: 'Manual Overrides',
	  options: [
		{ label: 'Override: High Risk', value: 'override-high' },
		{ label: 'Override: Medium Risk', value: 'override-medium' },
		{ label: 'Override: Low Risk', value: 'override-low' },
		{ label: 'Don\'t Evaluate', value: 'override-no-eval' },
	  ],
	},
  ];




export default class EvaluationSelection extends Component {
	constructor(props) {
		super(props);
		var to_set = { label: 'No Current Evaluation', value: 'def-no-eval' };

		this.state = {
			value: to_set
		}
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(obj) {
		var handle = JSON.parse(JSON.stringify(obj)); // This is to extract the object.
		var panel = this;
		$.ajax("/set-issue-evaluation-setting?jwt=" + jwt_token + "&project=" + get("project") + "&issueKey=" + get("issueKey") + "&type=" + handle.value.value, {
			"error": function (xhr, textStatus, errorThrown) {

			},
			"success": function (data) {
				console.log(data);
				panel.setState({msg: data});
			}
		});

		this.setState(obj);
	}

	render() {
		return (
			<Select options={GROUP_OPTIONS} value={this.state.value} onChange={value => this.handleChange({ value })}></Select>

		)

	}
}