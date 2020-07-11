import React, { useState, useEffect } from "react";
import { HashRouter as Router, Link, Route, useParams } from "react-router-dom";
import "./app.css";
import { v4 } from "uuid";

import Game from "./Game";

import * as firebase from "firebase/app";
import "firebase/database";

// Set the configuration for your app
// TODO: Replace with your project's config object
const config = {
  apiKey: "AIzaSyCPlEY2qyCPSyODTJo8Ews9iMxYvBsbnEw",
  authDomain: "cups-game-3ace7.firebaseapp.com",
  databaseURL: "https://cups-game-3ace7.firebaseio.com",
  storageBucket: "nam5.appspot.com"
};
firebase.initializeApp(config);

const App = () => {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [loginName, setLoginName] = useState("");
  const [gameId, setGameId] = useState("");

  const handleLogin = () => {
    localStorage.setItem("username", loginName);
    setUsername(loginName);
  };
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
  };

  const startGame = () => {
    const id = v4();
    firebase
      .database()
      .ref(id)
      .set({
        admin: username,
        participants: []
      });
    setGameId(id);
  };

  console.log("game id", gameId);

  return (
    <Router>
      <div className="pure-g">
        <div className="pure-u-1 center">
          <h1 className="">Cups Game</h1>
          <p className="">A fun game to learn about STIs</p>
          {username ? (
            <>
              <p>Logged in as: {username}</p>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
              />
              <button onClick={handleLogin}>Login</button>
            </>
          )}
        </div>
      </div>
      {username && (

        <button onClick={startGame}>Start Game</button>
      )}
      {/* {gameId && <Link to={`/${gameId}`}>Go To Game</Link>} */}
      <Route path="/:id">{username && <Game firebase={firebase} />}</Route>
    </Router>
  );
};

export default App;
