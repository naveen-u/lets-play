import React from "react";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import darkTheme from "./Themes/DarkTheme";
import Login from "./Components/Login";
import Play from "./Components/Play";

function App() {
  return (
    <RecoilRoot>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={darkTheme}>
          <Router>
            <Switch>
              <Route path="/" exact component={Login} />
              <Route path="/play" component={Play} />
            </Switch>
          </Router>
        </ThemeProvider>
      </StyledEngineProvider>
    </RecoilRoot>
  );
}

export default App;
