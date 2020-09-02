//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';

//atlassian
import Tooltip, { TooltipPrimitive } from '@atlaskit/tooltip';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';


export default class NumericFeatures extends Component {

	render() {
        var letters = ['A', 'B', 'C', 'D', 'E'];
        var featureCount = features.length;
        var featureTable = features.slice(0, 5).map((feature, key) => {
            return(
                <tr>
                    <td>
                        <Container>
                            <Row>
                                <Col xs={1}>
                                    <Tooltip content={feature.tooltip}>
                                        <QuestionCircleIcon size="small"/>
                                    </Tooltip> 
                                </Col>
                                <Col xs={1}>
                                    {letters[key]}
                                </Col>
                                <Col>
                                    {feature.name}
                                </Col>
                            </Row>
                        </Container>
                    </td>
                    <td style={{textAlign: 'center'}}>
                        {feature.value}
                    </td>
                </tr>
            )
        });

		return (
            <table>
                <tbody>
                    <tr>
                        <th>Top 5 of {featureCount} Features</th> 
                        <th>Value</th>                       
                    </tr>
                    {featureTable}
                </tbody>
            </table>
		)
	}
}