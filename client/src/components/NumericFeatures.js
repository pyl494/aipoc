//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';


export default class NumericFeatures extends Component {

	render() {
        var featureTable = features.map((feature) => {
            return(
                <tr>
                    <td>
                        {feature.name}
                    </td>
                    <td>
                        {feature.value}
                    </td>
                </tr>
            )
        });

		return (
            <table>
                <tbody>
                    <tr>
                        <th>Feature Name</th> 
                        <th>Value</th>                       
                    </tr>
                    {featureTable}
                </tbody>
            </table>
		)
	}
}