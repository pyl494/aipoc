import React, { Component } from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import { useLocation } from 'react-router-dom'
import { userParams } from 'react-router-dom'
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';
import Select from '@atlaskit/select';

const GROUP_OPTIONS = [
  {
    label: 'Machine Learning',
    options: [
      { label: 'Use RiskEvader Evaluation', value: 'risk-evader-eval' }
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




  render() {
    return (
		<div>
			<h1> HELLO GLANCE PANEL KUN </h1>
			<Lozenge appearance="removed" isBold>High Risk</Lozenge>

			<Select options={GROUP_OPTIONS} 
			placeholder="Choose a City" 
			defaultValue={{ label: 'Use RiskEvader Evaluation', value: 'risk-evader-eval' }}
			/>
		</div>
    );
  }
}
