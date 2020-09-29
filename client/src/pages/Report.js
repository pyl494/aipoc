//react
import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Histogram from 'react-chart-histogram';


export default class Report extends Component {
	render() {
        const labels = ['Low', 'Medium', 'High'];
        const data = [324, 45, 672];
        const options = { fillColor: '#FFFFFF', strokeColor: '#00875a' };

		return (
			<Container>
                <Row style={{paddingTop: 20}}>
                    <Col>
                        <h1>RiskEvader Report</h1>
                        <hr />
                    </Col>
                </Row>
                <Row style={{paddingTop: 20}}>
                    <Col>
                        <h2>Risk Counts</h2>
                        <hr />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Histogram
                            xLabels={labels}
                            yValues={data}
                            width='400'
                            height='200'
                            options={options}
                        />
                    </Col>
                </Row>
                <Row style={{paddingTop: 20}}>
                    <Col>
                        <h2>Historical Risk Counts</h2>
                        <hr />
                    </Col>
                </Row>
            </Container>
		);
	}
}
