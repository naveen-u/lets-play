import React from 'react';
import './App.css';
import Login from './Components/Login';
import Countdown from './Components/Countdown';
import darkTheme from './Themes/DarkTheme';
import { MuiThemeProvider } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <div className="App">
        <Router>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/play" component={Countdown} />
          </Switch>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
