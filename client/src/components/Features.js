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
        //console.log("features: "+features.length);
    }

	render() {
        var featureList = Object.keys(features).map(function(key) {
        return <div>{key}: {features[key]}</div>
        });

		return (
            <div>
                {
                    featureList
                }
            </div>
		)
	}
}