//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';

//components
//import Feature from './Feature'
import NumericFeatures from './NumericFeatures'

export default class Features extends Component {

	render() {
		return (
            <Container style={{paddingTop: "2em"}}>
                <NumericFeatures data={features} />
            </Container>
		)
	}
}