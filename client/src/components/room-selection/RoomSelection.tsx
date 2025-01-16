import React, { useEffect, useState } from "react";
import "./RoomSelection.css";
import Quizzer from "../quizzer/Quizzer";
import { useSocket } from "../providers/SocketProvider";
import { useGameState } from "../providers/GameStateProvider";

interface RoomSelectionScreenProps {
  gameMode: string;
}

const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = (props) => {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { socket } = useSocket();
  const { gameState, setGameState } = useGameState();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      socket.emit("joinRoom", {
        room: roomName.trim(),
        playerName: playerName.trim(),
      });
    }
  };

  useEffect(() => {
    socket.on("successfullyJoinedRoom", (data: any) => {
      if (data["isSuccessful"]) {
        setIsSubmitted(true);
        setRoomName(data["roomName"]);
      } else {
        alert("Failed to join room");
      }
    });

    socket.on("newPlayerId", (playerId) => {
      localStorage.setItem("myPlayerId", playerId);
      setGameState(gameState);
    });

    return () => {
      socket.off("roomFull");
      socket.off("newPlayerId");
    };
  });

  if (isSubmitted && roomName) {
    if (props.gameMode === "Quizzer") {
      return <Quizzer roomName={roomName} />;
    } else if (props.gameMode === "QuizMe") {
      // return <QuizMe roomName={roomName} />;
    }
  }

  return (
    <div className="RoomSelectionScreen">
      <header className="header">
        <h1>Welcome to {props.gameMode}</h1>
      </header>
      <form onSubmit={onSubmit}>
        <input
          className="input"
          type="text"
          value={roomName}
          required={true}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
        <input
          className="input"
          type="text"
          value={playerName}
          required={true}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
        />
        <div className="container">
          <button className="button" type="submit">
            Join Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomSelectionScreen;
