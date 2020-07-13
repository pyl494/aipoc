import React, { Component } from "react"

export default class Predictions extends Component {
	constructor(props) {

		
		super(props);
		this.state = {
			predictions: JSON.stringify(predictions)
		}

		console.log("predictions: "+this.state.predictions)
	}

	render() {
		return (
			<div>
				<h6>Predictions</h6>
				{this.state.predictions}
			</div>
		)
	}
}