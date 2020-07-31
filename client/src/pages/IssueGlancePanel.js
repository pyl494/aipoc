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

		console.log("Features: "+JSON.stringify(features[0]))

		var do_show = false;
		var lower_count = 0;
		var medium_count = 0;
		var high_count = 0;

		var risk_set = "";
		var lozenge_set = "";
		var web_colour = "rgb(0, 135, 90)";
		console.log("resultObject:" + JSON.stringify(resultObject));
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

		if (resultObject.all.manual != null || resultObject.all.manual != "None") {
			switch (resultObject.all.manual) {
				case 'low':
					web_colour = "rgb(0, 135, 90)";
					break;
				case 'medium':
					web_colour = "rgb(255, 139, 0)";
					break;
				case 'high':
					web_colour = "rgb(222, 53, 11)";
					break;
			}

		}


		//set_lozange(risk_set, lozenge_set);

		var totalWeight = features[0].weight+features[1].weight+features[2].weight+features[3].weight+features[4].weight;

		this.state = { 
			msg: "",
			risk: risk_set,
			lozenge_app: lozenge_set,
			lozengeShow: do_show,
			isOpen: false,
			manual: resultObject.all.manual,
			spider_web_data: [
				{
					data: {
						feature_1: features[0].weight/totalWeight,
						feature_2: features[1].weight/totalWeight,
						feature_3: features[2].weight/totalWeight,
						feature_4: features[3].weight/totalWeight,
						feature_5: features[4].weight/totalWeight
					},
					meta: {
						color: web_colour
					}
				}
			],
			spider_web_labels: {
				feature_1: features[0].name,
				feature_2: features[1].name,
				feature_3: features[2].name,
				feature_4: features[3].name,
				feature_5: features[4].name
			}
		};
		
		this.expand = this.expand.bind(this);
		this.updateWebColoring = this.updateWebColoring.bind(this);
	}
	
	expand(){
        this.setState({
            isOpen: !this.state.isOpen
		})
	}

	updateWebColoring(web_color) {
		console.log(this.state.spider_web_data);

		this.setState({ 
			spider_web_data : [ 
				{ 
					data: this.state.spider_web_data[0].data,
					meta: { color: web_color }
				} 
			]
		});

		console.log(this.state.spider_web_data);
	}


	
	render() {
		return (
			<Container fluid>
				<Row>
					<Col>
						<Tooltip content="Risk associated to this issues. Provided by machine learning or overrided."><h5>Risk Evaluation <QuestionCircleIcon size="small"/></h5></Tooltip>
					</Col>
				</Row>
				<Row>
					<Col>
						<EvaluationSelect risk={this.state.risk} manual={this.state.manual} webupdate={this.updateWebColoring}/>
					</Col>
				</Row>
				<Row style={{marginTop: "2em"}}>
					<Col>
						<Tooltip content="Aspects of the project with the highest influence on risk."><h5>Risk Influence <QuestionCircleIcon size="small"/></h5></Tooltip>
					</Col>
				</Row>
				<Row>
					<Col>
						<RadarChart
							captions={this.state.spider_web_labels} data={this.state.spider_web_data}
							options={{captionProps: () => ({
								className: 'caption',
								textAnchor: 'middle',
								fontSize: 'x-small',
								fontFamily: 'Segoe UI'
							})}}
						/>
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
