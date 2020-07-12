import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Redirect,
  useHistory,
} from "react-router-dom";
import { v4 } from "uuid";

import { useAuthDataContext } from "./AuthDataProvider";
import { useFirebaseContext } from "./FirebaseProvider";

const LoginForm = () => {
  const { user, userId, onLogout, onLogin } = useAuthDataContext();
  const [loginName, setLoginName] = useState("");
  const handleLogin = () => {
    onLogin({
      user: loginName,
      userId: v4()
    });
  };
  return (
    <form className="pure-form">
      <fieldset>
        <legend className="white">Enter your name to get started</legend>
        <div className="pure-control-group">
          <input
            type="text"
            id="aligned-name"
            placeholder="Username"
            value={loginName}
            onChange={e => setLoginName(e.target.value)}
          />
        </div>
        <div className="pure-controls">
          <button
            type="submit"
            className="pure-button submitButton pink-bg white"
            onClick={handleLogin}
          >
            Continue
          </button>
        </div>
      </fieldset>
    </form>
  );
};

const Home = () => {
  const { user, userId, onLogout, onLogin } = useAuthDataContext();
  const { getDatabase } = useFirebaseContext();
  const history = useHistory();

  const handleLogout = () => {
    onLogout();
    history.push('/');
  };

  const startGame = () => {
    const id = v4();
    getDatabase(id).set({
      admin: userId,
      participants: {
        [userId]: {
          role: "admin",
          userId
        }
      },
      gameActive: false,
      gameFinished: false
    });
    history.push(`/${id}`);
  };

  return user ? (
    <div className="loggedInBanner">
      <div className="pure-g">
        <div className="pure-u-1-2 imgWrapper">
          <div className="imgWrapper">
            <img
              className="pure-img"
              src="https://www.plannedparenthood.org/static/assets/img/planned-parenthood-horizontal.svg"
              alt="Planned Parenthood"
            />
          </div>
        </div>
        <div className="pure-u-1-2 textWrapper">
          <div className="pure-u-1-2 textWrapper">
            <p className="white">Logged in as: {user}</p>
          </div>
        </div>
        <div className="pure-u-1 buttonWrapper">
          <button className="pure-button" onClick={startGame}>
            Start Game
          </button>
          <button className="pure-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="loggedOutBanner">
      <div className="pure-g">
        <div className="pure-u-1 pink-bg white ppImage">
          <img
            className="pure-img center"
            src="https://www.plannedparenthood.org/static/assets/img/planned-parenthood-horizontal.svg"
            alt="Planned Parenthood"
          />
        </div>
        <div className="pure-u-1 center">
          <h1 className="">Cups Game</h1>
          <h2 className="">A fun game to learn about STIs</h2>
        </div>
        <div className="pure-u-1 center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
