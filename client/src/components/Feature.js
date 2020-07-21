//react
import React, { Component } from "react"

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

//components

export default class Feature extends Component {

	render() {
		return (
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
		)
	}
}