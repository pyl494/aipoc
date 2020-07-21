//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';

//components

//atlassian
import Lozenge, { ThemeAppearance } from '@atlaskit/lozenge';

export default class Feature extends Component {

	render() {
        var display;
        console.log("typeof: "+this.props.type)
        switch (this.props.type){
            case "string":
                display =
                    <Container>
                        <Row>
                            <Col>
                                {this.props.name}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Lozenge>{this.props.value}</Lozenge>
                            </Col>
                        </Row>
                    </Container>
                break;
            case "number":
                display =
                    <Container>
                        <Row>
                            <Col>
                                {this.props.name}
                            </Col>
                            <Col>
                                {this.props.value}
                            </Col>
                        </Row>
                    </Container>
                break;
            case "object":
                const items = this.props.value.map((item) => 
                    <Lozenge>{item}</Lozenge>
                );

                display = 
                    <Container>
                        <Row>
                            <Col>
                                {this.props.name}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {items}
                            </Col>
                        </Row>
                    </Container>
                break;
            default:
                display =
                    <div>
                        undefined
                    </div>
        }


		return (
            <div>
                {display}
            </div>
		)
	}
}