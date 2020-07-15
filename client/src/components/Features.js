//react
import React, { Component } from "react"

//font awesome
/*
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
*/

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

export default class Features extends Component {
    constructor(props){
        super(props);
        this.state = {
            featuresOpen: false
        };

        this.openFeatures = this.openFeatures.bind(this);
    }

    openFeatures(){
        this.setState({
            featuresOpen: true
        })
    }

	render() {
		return (
            <Container>
                <Row>
                    {this.state.featuresOpen &&
                        <div>
                            Features
                        </div>
                    }
                </Row>
                <Row>
                    <Col>
                        <h5><a style={{cursor: "pointer"}} onClick={this.openFeatures}>Show Features</a></h5>
                    </Col>
                </Row>
            </Container>
		)
	}
}