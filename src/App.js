import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/index.css';

import HomeIndex from './containers/index';
import NotFound from './containers/NotFound';

class App extends Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomeIndex} />
          <Route exact path="/join/:room" component={HomeIndex} />          
          <Route exact path="/join/:room/:token" component={HomeIndex} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    )
  }
}

export default App;
