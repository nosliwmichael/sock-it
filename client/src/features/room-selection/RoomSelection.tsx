import React, { useEffect, useState } from "react";
import "./RoomSelection.css";
import { useSocket } from "../../providers/SocketProvider";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../../providers/HeaderProvider";
import { useGameState } from "../../providers/GameStateProvider";

interface RoomSelectionScreenProps {
  gameMode?: any;
}

const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = (props) => {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { socket } = useSocket();
  const { setHeader } = useHeader();
  const { gameState } = useGameState();

  const navigate = useNavigate();

  useEffect(() => {
    setHeader('Select a Room');
  }, [setHeader]);

  useEffect(() => {
    if (!props.gameMode) {
      navigate("/");
    } else if (isSubmitted || gameState?.roomName) {
      navigate(props.gameMode?.path);
    }
  }, [isSubmitted, gameState, navigate, props.gameMode]);

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
        if (data["isSuccessful"]) {
          setIsSubmitted(true);
          setRoomName(data["roomName"]);
        }
      });
    }

    if (!socket.hasListeners("newPlayerId")) {
      socket.on("newPlayerId", (playerId) => {
        localStorage.setItem("myPlayerId", playerId);
      });
    }

    return () => {
      socket.off("successfullyJoinedRoom");
      socket.off("newPlayerId");
    };
  }, [socket]);

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
