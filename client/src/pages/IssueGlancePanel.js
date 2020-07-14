import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import { useLocation } from 'react-router-dom'
import { userParams } from 'react-router-dom'
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';
import Select from '@atlaskit/select';
import SectionMessage from '@atlaskit/section-message';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import AssigneeStatistics from '../components/AssigneStatistics';
import EvaluationSelect from '../components/EvaluationSelect.js';
import Predictions from '../components/Predictions.js';

export default class IssueGlancePanel extends Component {
	constructor(props) {
		super(props);
		var to_set = { label: 'No Current Evaluation', value: 'def-no-eval' };
		try {
			switch(evaluation_setting) {
				case 'risk-evader-eval':
					to_set = { label: 'Use RiskEvader Evaluation', value: 'risk-evader-eval' };
					break;
				case 'override-high':
					to_set = { label: 'Override: High Risk', value: 'override-high' };
					break;
				case 'override-medium':
					to_set = { label: 'Override: Medium Risk', value: 'override-medium' };
					break;
				case 'override-low':
					to_set = { label: 'Override: Low Risk', value: 'override-low' };
					break;
				case 'override-no-eval':
					to_set = { label: 'Don\'t Evaluate', value: 'override-no-eval' };
					break;

			}
		}
		catch (ex) { console.log(ex); }


		this.state = { 
			value: to_set ,
			msg: ""
		
		};
		
	}
	
	
  render() {
    return (
		<div>
			<h4>RiskEvader<Button><QuestionCircleIcon size="small" label=""/></Button></h4>

			<Lozenge appearance="removed" isBold>High Risk</Lozenge>
			<br/>
			<br/>
			<h5>Risk Rating</h5>
			<EvaluationSelect evaluation={this.state.value}></EvaluationSelect>

			<br/>
			<br/>

			<Predictions />

			<br/>
			<AssigneeStatistics data={assignee_stat}/>

		</div>
    );
  }
}
