//react
import React, { Component } from 'react';
import { useLocation } from 'react-router-dom'
import { userParams } from 'react-router-dom'

//atlassian
import Button, { ButtonGroup } from '@atlaskit/button';
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';
import Select from '@atlaskit/select';
import SectionMessage from '@atlaskit/section-message';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';

//components
import AssigneeStatistics from '../components/AssigneStatistics';
import EvaluationSelect from '../components/EvaluationSelect.js';
import Predictions from '../components/Predictions';
import Expand from '../components/Expand';
import Features from '../components/Features';

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

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

		var do_show = false;
		var lower_count = 0;
		var medium_count = 0;
		var high_count = 0;

		var risk_set = "";
		var lozenge_set = ""

		if (resultObject != null && resultObject != undefined && resultObject.hasOwnProperty("predictions")) {
			do_show = true;
			
			for (const [x, y] of Object.entries(resultObject.predictions)) { 
				if (y.toLowerCase() == "low") {lower_count++;}
				else if (y.toLowerCase() == "medium") {medium_count++;}
				else if (y.toLowerCase() == "high") { high_count++;}
			}


			if (lower_count > medium_count && lower_count > high_count) {
				risk_set = "Low Risk";
				lozenge_set = "success";
			}
			else if (medium_count > high_count) {
				risk_set = "Medium Risk";
				lozenge_set = "moved"
			}
			else {
				risk_set = "High Risk";
				lozenge_set = "removed"
			}
		}

		set_lozange(risk_set, lozenge_set);


		this.state = { 
			value: to_set,
			msg: "",
			risk: risk_set,
			lozenge_app: lozenge_set,
			lozengeShow: do_show
		};
		
	}
	
	
  render() {
    return (
		<Container>
			<Row>
				<Col>
					<h4>RiskEvader</h4>
				</Col>
				<Col>
					{ this.state.lozengeShow &&
						<Lozenge appearance={this.state.lozenge_app} isBold maxWidth={300}>{this.state.risk}</Lozenge>
					}
				</Col>
			</Row>
			<Row style={{marginTop: "2em"}}>
				<Col>
					<h5>Risk Evaluation</h5>
				</Col>
			</Row>
			<Row>
				<Col>
					<EvaluationSelect evaluation={this.state.value}></EvaluationSelect>
				</Col>
			</Row>
			<Row>
				<Col>
					<Expand>
						<Features />
					</Expand>
				</Col>
			</Row>
		</Container>
    );
  }
}
