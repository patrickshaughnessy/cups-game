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

const Participant = ({
  isAdmin,
  role,
  status,
  partners,
  user: participantName,
  userId: participantId,
  gameActive,
  myData
}) => {
  const { getDatabase } = useFirebaseContext();
  const { id } = useParams();

  // Requested means another user has requested me
  const requested = myData.requested || {};
  // Requesting means I am requesting another user
  const requesting = myData.requesting || {};
  const currentUser = myData.userId;
  const currentUserName = myData.user;
  console.log('mydata', myData);
  const handleConfirm = () => {
    if (myData.status === "INFECTED" || status === "INFECTED") {
      getDatabase(`${id}/participants/${participantId}`).update({
        status: "INFECTED",
        partners: (partners || 0) + 1
      });
      getDatabase(`${id}/participants/${currentUser}`).update({
        status: "INFECTED",
        partners: (myData.partners || 0) + 1
      });
    }
    getDatabase(`${id}/participants/${participantId}/requesting`).update({
      [currentUser]: false
    });
    getDatabase(`${id}/participants/${currentUser}/requested`).update({
      [participantId]: false
    });
  };

  const handleRequest = () => {
    console.log('user', currentUser);
    console.log('requesting', participantId);
    getDatabase(`${id}/participants/${currentUser}/requesting`).update({
      [participantId]: participantName
    });
    getDatabase(`${id}/participants/${participantId}/requested`).update({
      [currentUser]: currentUserName
    });
  }

  // Do not show self or admin
  if (role === 'admin' || currentUser === participantId) {
    return null;
  }

  const currentUserIsBeingRequested = requested[participantId] && (
    <div>
      <p>You are being requested by: {requested[participantId]}</p>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );

  const currentUserIsRequestingParticipant = requesting[participantId] && (
    <div>
      <p>You have requested this person: {requesting[participantId]}</p>
      <p>Please wait</p>
    </div>
  );

  const currentUserMayRequest = !requesting[participantId] && !requested[participantId] && (
    <div>
      <p>You may requested this person</p>
      <button onClick={handleRequest}>Request</button>
    </div>
  );

  return (
    <>
      <div>Participant: {participantName}</div>
      {!isAdmin && gameActive && (
        <>
          {currentUserIsBeingRequested}
          {currentUserIsRequestingParticipant}
          {currentUserMayRequest}
        </>
      )}
      {myData.role === 'admin' && (
        <>
          <p>status: {status}</p>
          <p>
            {JSON.stringify({
              status,
              partners,
              user: participantName,
              userId: participantId,
              gameActive,
              myData
            })}
          </p>
        </>
      )}
    </>
  );
};

const Game = ({ firebase }) => {
  const { user, userId } = useAuthDataContext();
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
          requesting: {},
          requested: {},
          partners: 0
        });
      }

      setParticipants(snapshot.val());
    });
    getDatabase(`${id}/gameActive`).on("value", snapshot => {
      setGameActive(snapshot.val());
    });
  }, [id, userId, getDatabase, user]);

  const myData = participants ? participants[userId] : {};
  console.log('participants', participants);
  return (
    <>
      <div>Game</div>
      {isAdmin ? <AdminView gameActive={gameActive} /> : <ParticipantView />}
      {participants &&
        Object.keys(participants).map(p => (
          <Participant
            key={participants[p].userId}
            {...participants[p]}
            gameActive={gameActive}
            myData={myData}
          />
        ))}
    </>
  );
};

export default Game;
