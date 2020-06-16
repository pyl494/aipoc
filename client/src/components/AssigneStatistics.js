import React, { Component } from "react"
import Tabs,  { TabContent, TabItem } from '@atlaskit/tabs';

export default class AssigneeStatistics extends Component {
	constructor(props) {
		super(props);
		console.log("Hello" + props.data);
		// Prepare State.
		this.state = {
			tabs: [
				{ label: 'Workload' },
				{ label: 'Delays' }
			],
			data: props.data,
			content_data: [[], []]
		};
		


		for (var i = 0; i != props.data.length; i++) {
			this.state.content_data[0].push( { assignee: props.data[i].assignee, issuenum: props.data[i].issuenum  } );
			this.state.content_data[1].push( { assignee: props.data[i].assignee, delays: props.data[i].delays } );
		}

		this.state.tabs[0].content = <table id='issue_tab'><tbody>{this.render_issue_table_data()}</tbody></table>;
		this.state.tabs[1].content = <table id='delay_tab'><tbody>{this.render_delay_table_data()}</tbody></table>;
	}

	render_issue_table_data() {
		return this.state.content_data[0].map((content, index) => {
			const { assignee, issuenum } = content
			return (
				<tr key={index}>
					<td>{assignee}</td>
					<td>{issuenum}</td>
				</tr>
			)
		});
	}

	render_delay_table_data() {
		return this.state.content_data[1].map((content, index) => {
			const { assignee, delays } = content
			return (
				<tr key={index}>
					<td>{assignee}</td>
					<td>{delays}</td>
				</tr>
			)
		});
	}


	add_tab( tab ) {
		this.state.tabs.push(tab);
	}

	render() {
		var construct_content;
		return (
			<div>
				<Tabs tabs={this.state.tabs}/>
			</div>
		)
	}
}