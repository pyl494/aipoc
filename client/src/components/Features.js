//react
import React, { Component } from "react"

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

//components
import Feature from './Feature'

export default class Features extends Component {

	render() {
        var featureList = Object.keys(features).map(function(key) {
            return(
                <Row>
                    <Col>
                        <Feature name={key} value={features[key]} />
                    </Col>
                </Row>
            )
        });

		return (
            <Container>
                <Row>
                    <Col>
                        {featureList}
                    </Col>
                </Row>
            </Container>
		)
	}
}