import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext
} from "react";
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

export const FirebaseContext = createContext(null);

const FirebaseProvider = props => {
  const getDatabase = path => firebase.database().ref(path);

  return <FirebaseContext.Provider value={{ getDatabase }} {...props} />;
};

export const useFirebaseContext = () => useContext(FirebaseContext);

export default FirebaseProvider;
