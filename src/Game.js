import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";


const Participant = () => {
  return (
    <>
      <div>Participant</div>
    </>
  );
};

const Game = ({ firebase }) => {
  const [admin, setAdmin] = useState();
  const [participants, setParticipants] = useState();
  const { id } = useParams();
  console.log("id", id);

  useEffect(() => {
    firebase
      .database()
      .ref(`${id}/admin`)
      .once("value")
      .then(snapshot => {
        console.log("once", snapshot.val());
        setAdmin(snapshot.val());
      });
    firebase
      .database()
      .ref(`${id}/participants`)
      .on("value", snapshot => {
        console.log("on participants", snapshot.val());
        setParticipants(snapshot.val());
      });
  }, [id, firebase]);

  return (
    <>
      <div>Game</div>
      {admin && admin === localStorage.getItem("username") ? (
        <p>You are the admin</p>
      ) : <p>You are a participant</p>}
      {participants && participants.map(p => <Participant key={p.id} {...p} />)}
    </>
  );
};

export default Game;
