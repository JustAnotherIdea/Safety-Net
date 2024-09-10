
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Resources from './components/Resources';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Search} />
          <Route path="/resources" component={Resources} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
