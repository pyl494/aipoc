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

        var featureTable = features.map((feature, key) => {
            return(
                <tr align="center">
                    <td>
                        <Container>
                            <Row>
                                <Col xs={1}>
                                    {letters[key]}
                                </Col>
                                <Col>
                                    {feature.name}
                                </Col>
                            </Row>
                        </Container>
                    </td>
                    <td>
                        <Container fluid={true}>
                            {feature.value}
                        </Container>
                                               
                    </td>
                </tr>
            )
        });

		return (
            <table>
                <tbody>
                    <tr>
                        <th>Feature</th> 
                        <th>Value</th>                       
                    </tr>
                    {featureTable}
                </tbody>
            </table>
		)
	}
}