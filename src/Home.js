import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Redirect,
  useParams
} from "react-router-dom";
import { v4 } from "uuid";

import { useAuthDataContext } from "./AuthDataProvider";
import { useFirebaseContext } from "./FirebaseProvider";

const Home = () => {
  const { user, userId, onLogout, onLogin } = useAuthDataContext();
  const { getDatabase } = useFirebaseContext();

  const [redirect, setRedirect] = useState(false);
  const [loginName, setLoginName] = useState("");

  const handleLogin = () => {
    onLogin({
      user: loginName,
      userId: v4()
    });
  };
  const handleLogout = () => {
    onLogout();
  };

  const startGame = () => {
    const id = v4();
    getDatabase(id).set({
      admin: userId,
      participants: {
        [userId]: {
          role: 'admin',
          userId
        }
      },
      gameActive: false,
      gameFinished: false
    });
    setRedirect(id);
  };

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  return (
    <div className="pure-g">
      <div className="pure-u-1 center">
        <h1 className="">Cups Game</h1>
        <p className="">A fun game to learn about STIs</p>
        {user ? (
          <>
            <p>Logged in as: {user}</p>
            <p>id: {userId}</p>
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
        {user && <button onClick={startGame}>Start Game</button>}
      </div>
    </div>
  );
};

export default Home;
