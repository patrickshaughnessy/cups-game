import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";

import Game from "./Game";
import Home from "./Home";
import AuthDataProvider from "./AuthDataProvider";
import FirebaseProvider from "./FirebaseProvider";

const App = () => {
  return (
    <AuthDataProvider>
      <FirebaseProvider>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/:id" component={Game} />
        </Router>
      </FirebaseProvider>
    </AuthDataProvider>
  );
};

export default App;
