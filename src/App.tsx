import React from "react";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MuiThemeProvider } from "@material-ui/core";
import darkTheme from "./Themes/DarkTheme";
import Login from "./Components/Login";
import Play from "./Components/Play";

function App() {
  return (
    <RecoilRoot>
      <MuiThemeProvider theme={darkTheme}>
        <Router>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/play" component={Play} />
          </Switch>
        </Router>
      </MuiThemeProvider>
    </RecoilRoot>
  );
}

export default App;
