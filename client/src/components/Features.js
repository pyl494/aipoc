//react
import React, { Component } from "react"

//bootstrap
import { Container, Row, Col } from 'react-bootstrap';

//components

export default class Features extends Component {

	render() {
        var featureList = Object.keys(features).map(function(key) {
            return(
                <tr>
                    <td>{key}</td>
                    <td>{features[key]}</td>
                </tr>
            )
        });

		return (
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {featureList}
                </tbody>
            </table>
		)
	}
}