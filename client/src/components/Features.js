//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';

//components
import Feature from './Feature'

export default class Features extends Component {

	render() {
        var featureList = Object.keys(features).map(function(key) {
            return(
                <Row style={{paddingTop: "1em"}}>
                    <Col>
                        <Feature type={typeof features[key]} name={key} value={features[key]} />
                    </Col>
                </Row>
            )
        });

		return (
            <Container>
                {featureList}
            </Container>
		)
	}
}