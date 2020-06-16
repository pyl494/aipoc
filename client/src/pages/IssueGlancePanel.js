import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import { useLocation } from 'react-router-dom'
import { userParams } from 'react-router-dom'
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';
import Select from '@atlaskit/select';
import SectionMessage from '@atlaskit/section-message';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import AssigneeStatistics from '../components/AssigneStatistics';

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






export default class IssueGlancePanel extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			value: { label: 'No Current Evaluation', value: 'def-no-eval' } ,
			msg: ""
		
		};
		
		this.handleChange = this.handleChange.bind(this);
	}
	
	

	handleChange(obj) {
		var handle = JSON.parse(JSON.stringify(obj)); // This is to extract the object.
		var panel = this;
		$.ajax("/set-issue-evaluation-setting?jwt=" + jwt_token + "&issueKey=" + get("issueKey") + "&type=" + handle.value.value, {
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
		<div>
			<h4>RiskEvader<Button><QuestionCircleIcon size="small" label=""/></Button></h4>

			<Lozenge appearance="removed" isBold>High Risk</Lozenge>
			<br/>
			<br/>
			<Select options={GROUP_OPTIONS} value={this.state.value} onChange={value => this.handleChange({ value })}>
				
			</Select>
			<p>{this.state.msg}</p>

			<br/>			
			<SectionMessage appearance="warning" title="Warning!">
        		<p>There are several high risk factors in this change request!</p>
      		</SectionMessage>
			<AssigneeStatistics data={assignee_stat}/>





		</div>
    );
  }
}
