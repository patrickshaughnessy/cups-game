import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';

const Main = () => {
  const [redirect, setRedirect] = useState(false);

  return (
    <>
      <div className="jumbotron jumbotron-fluid">
        <div className="container">
          <h1 className="display-4">Cups Game</h1>
          <p className="lead">This is a fun game to learn about STIs</p>
          <button className="button" onClick={() => setRedirect('/game')}>
            Start a new game
          </button>
          {redirect && <Redirect to={redirect} />}
        </div>
      </div>
    </>
  );
};

const Game = () => {
  return (
    <>
      <h1>game</h1>
    </>
  );
};

const App = () => (
  <Router>
    <Switch>
      <Route path="/:id">
        <Game />
      </Route>
      <Route path="/">
        <Main />
      </Route>
    </Switch>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('root'));
