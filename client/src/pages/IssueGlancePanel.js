//react
import React, { Component } from 'react';
import { useLocation } from 'react-router-dom'
import { userParams } from 'react-router-dom'

//atlassian
import Button, { ButtonAppearances  } from '@atlaskit/button';
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';
import Select from '@atlaskit/select';
import SectionMessage from '@atlaskit/section-message';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import QuestionIcon from '@atlaskit/icon/glyph/question';
import Tooltip, { TooltipPrimitive } from '@atlaskit/tooltip';

//components
import AssigneeStatistics from '../components/AssigneStatistics';
import EvaluationSelect from '../components/EvaluationSelect.js';
import Features from '../components/Features';

//reactstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';

//radar chart
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css'

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
		var lozenge_set = "";
		var web_colour = "blue";

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
				web_colour = "rgb(0, 135, 90)";

			}
			else if (medium_count > high_count) {
				risk_set = "Medium Risk";
				lozenge_set = "moved"
				web_colour = "rgb(255, 139, 0)";
			}
			else {
				risk_set = "High Risk";
				lozenge_set = "removed"
				web_colour = "rgb(222, 53, 11)";
			}
		}

		set_lozange(risk_set, lozenge_set);


		this.state = { 
			value: to_set,
			msg: "",
			risk: risk_set,
			lozenge_app: lozenge_set,
			lozengeShow: do_show,
			isOpen: false,
			spider_web_data: [
				{
					data: {
						number_of_issues: 0.7,
						number_of_bugs: 0.3,
						number_of_comments: 0.2,
						elapsed_time: 0.5,
						delays: 0.9
					},
					meta: { color: web_colour }
				}
			],
			spider_web_labels: {
				number_of_issues: "Issues",
				number_of_bugs: "Bugs",
				number_of_comments: "Comments",
				elapsed_time: "Time",
				delays: "Delays"
			}
		};
		
		this.expand = this.expand.bind(this);
	}
	
	expand(){
        this.setState({
            isOpen: !this.state.isOpen
		})
	}


	
	render() {
		//i need this passed from the backend
		const dummy = {
			weights: [
				{
					data: {
						number_of_issues: 0.7,
						number_of_bugs: 0.3,
						number_of_comments: 0.2,
						elapsed_time: 0.5,
						delays: 0.9
					},
					meta: { color: "blue" }
				}
			],
			featureNames: {
				number_of_issues: "Issues",
				number_of_bugs: "Bugs",
				number_of_comments: "Comments",
				elapsed_time: "Time",
				delays: "Delays"
			}
		}

		const data = dummy.weights

		const captions = dummy.featureNames

		return (
			<Container fluid>
				<Row>
					<Col>
						<Tooltip content="Hello World"><h5>Risk Evaluation <QuestionCircleIcon size="small"/></h5></Tooltip>
					</Col>
				</Row>
				<Row>
					<Col>
						<EvaluationSelect risk={this.state.risk}/>
					</Col>
				</Row>
				<Row style={{marginTop: "2em"}}>
					<Col>
						<Tooltip content="Hello World"><h5>Risk Influence <QuestionCircleIcon size="small"/></h5></Tooltip>
					</Col>
				</Row>
				<Row>
					<Col>
						<RadarChart captions={this.state.spider_web_labels} data={this.state.spider_web_data} />
					</Col>
				</Row>
				<Row style={{paddingBottom: "2em", paddingTop: "2em"}}>
					<Col>
						<Button onClick={this.expand}>
									{this.state.isOpen ?
										<div>Hide Features</div> :
										<div>Show Features</div>
									}
						</Button>
						<Collapse isOpen={this.state.isOpen}>
							<Features />
						</Collapse>
					</Col>
				</Row>
			</Container>
		);
	}
}
