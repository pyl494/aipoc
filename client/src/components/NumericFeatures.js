//react
import React, { Component } from "react"

//bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row, Col, Collapse } from 'reactstrap';


export default class NumericFeatures extends Component {

	render() {
        var featureTable = Object.keys(features).map(function(key) {
            return(
                <tr>
                    <td>
                        {key}
                    </td>
                    <td>
                        {features[key]}
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