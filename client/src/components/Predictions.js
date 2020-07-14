import React, { Component } from "react"

export default class Predictions extends Component {
	constructor(props) {

		
		super(props);
		this.state = {
			predictions: predictions
		}

		console.log("predictions: "+JSON.stringify(predictions))
	}

	render() {
		return (
			<div>
				<h6>Predictions</h6>
				Nearest Neighbors: {this.state.predictions["Nearest Neighbors"]}
				<br />
				RBF SVM: {this.state.predictions["RBF SVM"]}
				<br />
				Decision Tree: {this.state.predictions["Decision Tree"]}
				<br />
				Random Forest: {this.state.predictions["Random Forest"]}
				<br />
				Neural Net: {this.state.predictions["Neural Net"]}
				<br />
				AdaBoost: {this.state.predictions["AdaBoost"]}
			</div>
		)
	}
}