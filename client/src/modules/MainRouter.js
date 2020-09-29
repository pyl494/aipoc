import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import IssueGlancePanel from '../pages/IssueGlancePanel';
import Report from '../pages/Report';

export default class MainRouter extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <Router history={browserHistory}>
		    <Route path="/issue-glance-panel" component={IssueGlancePanel}/>
        <Route path="/report" component={Report}/>
      </Router>
    );
  }
}
