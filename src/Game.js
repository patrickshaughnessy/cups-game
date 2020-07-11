import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAuthDataContext } from "./AuthDataProvider";
import { useFirebaseContext } from "./FirebaseProvider";

const AdminView = ({ gameActive }) => {
  const { id } = useParams();
  const { getDatabase } = useFirebaseContext();
  const handleClick = () => {
    getDatabase(`${id}/participants`)
      .once("value")
      .then(snapshot => {
        const participants = snapshot.val();

        if (participants) {
          const total = Object.keys(participants).length - 1;
          const indices = Array(3)
            .fill(1)
            .map(() => Math.floor(Math.random() * total));
          Object.keys(participants).forEach((p, i) => {
            if (indices.includes(i)) {
              const { userId } = participants[p];
              getDatabase(`${id}/participants/${userId}/status`).set(
                "INFECTED"
              );
            }
          });

          getDatabase(`${id}/gameActive`).set(true);
        }
      });
  };
  return (
    <>
      <p>Admin view</p>
      {!gameActive && <button onClick={handleClick}>Begin</button>}
    </>
  );
};
const ParticipantView = () => {
  return <p>Participant view</p>;
};

const Participant = ({ isAdmin, role, status, partners, user, userId, gameActive, myData }) => {
  const { userId: authUser } = useAuthDataContext();
  const { getDatabase } = useFirebaseContext();
  const { id } = useParams();
  console.log("userId", userId);
  if (role === "admin" || authUser === userId) {
    return null;
  }

  const handleClick = () => {
    console.log("click part", user, userId);
    if (myData.status === 'INFECTED' || status === "INFECTED") {
      getDatabase(`${id}/participants/${userId}`).update({
        status: "INFECTED",
        partners: (partners || 0) + 1,
      });
      getDatabase(`${id}/participants/${authUser}`).update({
        status: "INFECTED",
        partners: (myData.partners || 0) + 1,
      });
    }
  };

  return (
    <>
      <div>Participant: {user}</div>
      {!isAdmin && gameActive && (
        <>
          <button onClick={handleClick}>Do it</button>
        </>
      )}
      {isAdmin && (
        <>
          <p>status: {status}</p>
        </>
      )}
    </>
  );
};

const Game = ({ firebase }) => {
  const { user, userId, onLogout, onLogin } = useAuthDataContext();
  const { getDatabase } = useFirebaseContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [participants, setParticipants] = useState();
  const { id } = useParams();

  useEffect(() => {
    getDatabase(`${id}/admin`)
      .once("value")
      .then(snapshot => {
        if (userId === snapshot.val()) setIsAdmin(true);
      });
    getDatabase(`${id}/participants`).on("value", snapshot => {
      if (userId && !snapshot.val()[userId]) {
        getDatabase(`${id}/participants/${userId}`).set({
          user,
          userId,
          status: "READY",
          partners: 0
        });
      }

      setParticipants(snapshot.val());
    });
    getDatabase(`${id}/gameActive`).on("value", snapshot => {
      setGameActive(snapshot.val());
    });
  }, [id, userId, getDatabase, user]);

  const myData = participants && participants[userId] || {};

  return (
    <>
      <div>Game</div>
      {isAdmin ? <AdminView gameActive={gameActive} /> : <ParticipantView />}
      {participants &&
        Object.keys(participants).map(p => (
          <Participant
            key={participants[p].userId}
            {...participants[p]}
            isAdmin={isAdmin}
            gameActive={gameActive}
            myData={myData}
          />
        ))}
    </>
  );
};

export default Game;
