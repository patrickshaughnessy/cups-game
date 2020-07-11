import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
import "./app.css";
import { v4 } from "uuid";

import Game from "./Game";
import Home from "./Home";
import AuthDataProvider from "./AuthDataProvider";
import FirebaseProvider from "./FirebaseProvider";

const App = () => {
  return (
    <AuthDataProvider>
      <FirebaseProvider>
        <Router>
          {/* <Switch> */}
          <Route path="/" component={Home} />
          <Route path="/:id" component={Game} />
          {/* </Switch> */}
        </Router>
      </FirebaseProvider>
    </AuthDataProvider>
  );
};

export default App;
