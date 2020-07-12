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
          const indices = Array(total < 10 ? 1 : 2)
            .fill(1)
            .map(() => Math.ceil(Math.random() * total));

          const initials = [];
          Object.keys(participants).forEach((p, i) => {
            if (indices.includes(i) && participants[p].role !== "admin") {
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
    <div className="topView">
      <div className="pure-g">
        <div className="pure-u-1">
          <h4>You are the ADMIN</h4>
          <p>
            On this screen you can view all the participants, start and stop the
            game and view results.
          </p>
        </div>
      </div>
      {!gameActive && (
        <div className="pure-g">
          <div className="pure-u-1">
            <div className="margin box">
              <p>
                Once all participants have joined, click below to start the game
              </p>
              <button onClick={handleClick}>Start the game</button>
            </div>
          </div>
        </div>
      )}
      <div className="pure-g">
        <div className="pure-u-1">
          <ul>
            <li>
              <span className="blue">
                "Negative" status will be shown in blue
              </span>
            </li>
            <li>
              <span className="pink">
                "Positive" status will be shown in pink
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
const ParticipantView = ({ partners, gameActive }) => {
  return (
    <div className="topView">
      <div className="pure-g">
        <div className="pure-u-1">
          <div className="margin">
            <h4>You are a PARTICIPANT</h4>
            <p>
              The other participants will be shown below. Once the ADMIN starts
              the game, you will be able to choose up to 3 partners. Select your
              desired partner and wait for confirmation.
            </p>
            <ul>
              <li>
                <span className="blue">
                  Available partners will be shown in blue
                </span>
              </li>
              <li>
                <span className="pink">
                  Participants who have selected you will be shown in pink
                </span>
              </li>
              <li>
                <span className="gray">
                  Partners that you have selected but haven't confirmed yet in
                  gray
                </span>
              </li>
            </ul>
            {!gameActive && <p>Please wait for the game to start</p>}
            {gameActive && <p>You have <span className="partnersRemaining">{3 - partners}</span> partners remaining</p>}
          </div>
        </div>
      </div>
    </div>
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

  const currentUserIsBeingRequested =
    requested[participantId] && currentUserPartners < 3;

  const currentUserIsRequestingParticipant =
    requesting[participantId] && currentUserPartners < 3;

  const currentUserMayRequest =
    !requesting[participantId] &&
    !requested[participantId] &&
    currentUserPartners < 3 &&
    partners < 3;

  const handleClick = () => {
    if (currentUserMayRequest) {
      return handleRequest();
    }
    if (currentUserIsRequestingParticipant) {
      return handleUnRequest();
    }
    if (currentUserIsBeingRequested) {
      return handleConfirm();
    }
  };

  let boxClass;
  if (!gameActive) {
    boxClass = "notActive";
  } else if (currentUserMayRequest) {
    boxClass = "mayRequest";
  } else if (currentUserIsRequestingParticipant) {
    boxClass = "isRequesting";
  } else if (currentUserIsBeingRequested) {
    boxClass = "isBeingRequested";
  }

  let adminBoxClass = "";
  if (myData.role === "admin") {
    adminBoxClass = status === "INFECTED" ? "positive" : "negative";
  }

  return (
    <div className="pure-u-1-2 pure-u-md-1-3 pure-u-lg-1-4">
      <div className="participant">
        <button
          className={`box ${boxClass} ${adminBoxClass}`}
          onClick={handleClick}
        >
          <div>{participantName}</div>
        </button>
      </div>
    </div>
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
    <div className="gamePage">
      {isAdmin ? (
        <AdminView gameActive={gameActive} />
      ) : (
        <ParticipantView gameActive={gameActive} {...myData} />
      )}
      <div className="pure-g">
        {participants &&
          Object.keys(participants).map(p => (
            <Participant
              key={participants[p].userId}
              {...participants[p]}
              gameActive={gameActive}
              myData={myData}
            />
          ))}
      </div>
    </div>
  );
};

export default Game;
