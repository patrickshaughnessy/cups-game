import React, { createContext, useState, useEffect, useMemo, useContext } from "react";

export const AuthDataContext = createContext(null);

const initialAuthData = {};

const AuthDataProvider = props => {
  const [authData, setAuthData] = useState(initialAuthData);

  /* The first time the component is rendered, it tries to
   * fetch the auth data from a source, like a cookie or
   * the localStorage.
   */
  useEffect(() => {
    const currentAuthData = JSON.parse(localStorage.getItem('cupsAuth'));
    if (currentAuthData) {
      setAuthData(currentAuthData);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('cupsAuth');
    setAuthData(initialAuthData)
  };

  const onLogin = newAuthData => {
    localStorage.setItem('cupsAuth', JSON.stringify(newAuthData));
    setAuthData(newAuthData)
  };

  const authDataValue = useMemo(() => ({ ...authData, onLogin, onLogout }), [authData]);

  return <AuthDataContext.Provider value={authDataValue} {...props} />;
};

export const useAuthDataContext = () => useContext(AuthDataContext);

export default AuthDataProvider;