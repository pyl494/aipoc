//react
import React, { Component } from "react"

//font awesome
/*
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
*/

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

export default class Expand extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false
        };

        this.expand = this.expand.bind(this);
    }

    expand(){
        this.setState({
            open: !this.state.open
        })
    }

	render() {
		return (
            <Container>
                <Row>
                    {this.state.open &&
                        <div style={{marginTop: "2em"}}>
                            {this.props.children}
                        </div>
                    }
                </Row>
                <Row>
                    <Col style={{marginTop: "2em"}}>
                        <h5>
                            <a style={{cursor: "pointer"}} onClick={this.expand}>
                                {this.state.open ?
                                    <div>Hide Features</div> :
                                    <div>Show Features</div>
                                }
                            </a>
                        </h5>
                    </Col>
                </Row>
            </Container>
		)
	}
}