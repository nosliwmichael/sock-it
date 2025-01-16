import React, { useEffect, useState } from "react";
import "./RoomSelection.css";
import { useSocket } from "../providers/SocketProvider";
import { useGameState } from "../providers/GameStateProvider";
import { useNavigate } from "react-router-dom";

interface RoomSelectionScreenProps {
  gameMode?: any;
  setHeader: (header: string) => void;
}

const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = (props) => {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { socket } = useSocket();
  const { gameState, setGameState } = useGameState();

  const navigate = useNavigate();

  useEffect(() => {
    props.setHeader("Select a Room");

    if (!props.gameMode) {
      navigate("/");
    } else if (isSubmitted) {
      navigate(props.gameMode?.path);
    }
  }, [props, navigate, isSubmitted]);

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
    if (!socket.hasListeners("successfullyJoinedRoom")) {
      socket.on("successfullyJoinedRoom", (data: any) => {
        console.log("successfullyJoinedRoom", data);
        if (data["isSuccessful"]) {
          setIsSubmitted(true);
          setRoomName(data["roomName"]);
        }
      });
    }

    if (!socket.hasListeners("newPlayerId")) {
      socket.on("newPlayerId", (playerId) => {
        console.log("newPlayerId", playerId);
        localStorage.setItem("myPlayerId", playerId);
        setGameState(gameState);
      });
    }

    return () => {
      socket.off("successfullyJoinedRoom");
      socket.off("newPlayerId");
    };
  }, [socket, gameState, setGameState]);

  return (
    <div className="RoomSelectionScreen">
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
