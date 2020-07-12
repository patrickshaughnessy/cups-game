import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAuthDataContext } from "./AuthDataProvider";
import { useFirebaseContext } from "./FirebaseProvider";

const AdminView = ({ gameActive }) => {
  const { id } = useParams();
  const { getDatabase } = useFirebaseContext();
  const [initialInfected, setInitialInfected] = useState();
  const handleClick = () => {
    getDatabase(`${id}/participants`)
      .once("value")
      .then(snapshot => {
        const participants = snapshot.val();

        if (participants) {
          const total = Object.keys(participants).length - 1;
          const indices = Array(1)
            .fill(1)
            .map(() => Math.ceil(Math.random() * total));

          const initials = [];
          Object.keys(participants).forEach((p, i) => {
            if (indices.includes(i) && participants[p].role !== 'admin') {
              const { userId, user } = participants[p];
              getDatabase(`${id}/participants/${userId}/status`).set(
                "INFECTED"
              );
              initials.push(user);
            }
          });

          getDatabase(`${id}/gameActive`).set(true);
          setInitialInfected(initials);
        }
      });
  };
  return (
    <>
      <p>Admin view</p>
      {initialInfected && <p>Initial Infected: {JSON.stringify(initialInfected)}</p>}
      {!gameActive && <button onClick={handleClick}>Begin</button>}
    </>
  );
};
const ParticipantView = ({ partners }) => {
  return (
    <>
      <p>Participant view, partners remaining: {3 - (partners || 0)}</p>
    </>
  );
};

const Participant = ({
  isAdmin,
  role,
  status,
  partners,
  user: participantName,
  userId: participantId,
  gameActive,
  myData = {}
}) => {
  const { getDatabase } = useFirebaseContext();
  const { id } = useParams();

  // Requested means another user has requested me
  const requested = myData.requested || {};
  // Requesting means I am requesting another user
  const requesting = myData.requesting || {};
  const currentUser = myData.userId;
  const currentUserName = myData.user;
  const currentUserPartners = myData.partners;

  const handleConfirm = () => {
    const getsInfected = myData.status === "INFECTED" || status === "INFECTED";

    getDatabase(`${id}/participants/${participantId}`).update({
      status: getsInfected ? "INFECTED" : "READY"
    });
    getDatabase(`${id}/participants/${currentUser}`).update({
      status: getsInfected ? "INFECTED" : "READY",
      partners: (myData.partners || 0) + 1
    });
    getDatabase(`${id}/participants/${participantId}/requesting`).update({
      [currentUser]: false
    });
    getDatabase(`${id}/participants/${currentUser}/requested`).update({
      [participantId]: false
    });
  };

  const handleRequest = () => {
    getDatabase(`${id}/participants/${currentUser}/requesting`).update({
      [participantId]: participantName
    });
    getDatabase(`${id}/participants/${currentUser}`).update({
      partners: (myData.partners || 0) + 1
    });
    getDatabase(`${id}/participants/${participantId}/requested`).update({
      [currentUser]: currentUserName
    });
  };

  const handleUnRequest = () => {
    getDatabase(`${id}/participants/${currentUser}/requesting`).update({
      [participantId]: false
    });
    getDatabase(`${id}/participants/${currentUser}`).update({
      partners: myData.partners - 1
    });
    getDatabase(`${id}/participants/${participantId}/requested`).update({
      [currentUser]: false
    });
  };

  // Do not show self or admin
  if (role === "admin" || currentUser === participantId) {
    return null;
  }

  const currentUserIsBeingRequested = requested[participantId] && currentUserPartners < 3 && (
    <div>
      <p>You are being requested by: {requested[participantId]}</p>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );

  const currentUserIsRequestingParticipant = requesting[participantId] && currentUserPartners < 3 && (
    <div>
      <p>You have requested this person: {requesting[participantId]}</p>
      <p>Please wait</p>
      <button onClick={handleUnRequest}>Un-request</button>
    </div>
  );

  const currentUserMayRequest = !requesting[participantId] &&
    !requested[participantId] &&
    currentUserPartners < 3 &&
    partners < 3 && (
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
      {myData.role === "admin" && (
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

  return (
    <>
      <div>Game</div>
      {isAdmin ? (
        <AdminView gameActive={gameActive} />
      ) : (
        <ParticipantView {...myData} />
      )}
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
