import React, { useState, useEffect } from "react";
import { HashRouter as Router, Link, Route } from "react-router-dom";

const App = () => {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [loginName, setLoginName] = useState("");

  const handleLogin = () => {
    localStorage.setItem("username", loginName);
    setUsername(loginName);
  };
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
  };

  return (
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
  );
};

export default App;
