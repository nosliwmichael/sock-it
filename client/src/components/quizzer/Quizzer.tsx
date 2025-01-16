import React, { useState, useEffect } from "react";
import "./Quizzer.css";
import { useSocket } from "../providers/SocketProvider";
import RoomSelectionScreen from "../room-selection/RoomSelection";
import { GameState } from "../../models/gameState";
import { useGameState } from "../providers/GameStateProvider";
import { Player } from "../../models/player";

interface QuizzerScreenProps {
  roomName: string;
}

const QuizzerScreen: React.FC<QuizzerScreenProps> = ({ roomName }) => {
  const { socket } = useSocket();
  const { gameState, setGameState } = useGameState();
  const [me, setMe] = useState<Player | undefined>(undefined);
  const [opponent, setOpponent] = useState<Player | undefined>(undefined);
  const [startTimer, setStartTimer] = useState<number>(15);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isLeaveRoom, setIsLeaveRoom] = useState<boolean>(false);

  const myPlayerId = localStorage.getItem("myPlayerId");

  const leaveRoom = (e: React.MouseEvent) => {
    socket.emit("leaveRoom");
    setIsLeaveRoom(true);
  };

  useEffect(() => {
    const handleStateChange = (newGameState: GameState) => {
      newGameState.players = new Map(newGameState.players);
      newGameState.players.forEach((player) => {
        if (player.id === myPlayerId) {
          setMe(player);
        } else {
          setOpponent(player);
        }
      });
      console.log("newGameState", newGameState);
      setGameState(newGameState);
    };

    const handleStartTimer = (t: number) => {
      setStartTimer(t);
      if (0 === t) {
        setIsGameStarted(true);
      }
    };

    if (!socket.hasListeners("stateChange")) {
      socket.on("stateChange", handleStateChange);
    }
    if (!socket.hasListeners("startTimer")) {
      socket.on("startTimer", handleStartTimer);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("stateChange");
      socket.off("startTimer");
      socket.off("gameOver");
    };
  }, [socket, myPlayerId, setGameState, roomName]);

  if (isLeaveRoom) {
    return <RoomSelectionScreen gameMode="Quizzer" />;
  }

  return (
    <div className="QuizzerScreen">
      <header className="header">
        <h1>Quizzer: {roomName} Room</h1>
      </header>

      <div className="scoreboard">
        <table>
          <tbody>
            <tr>
              <td>{me?.name}</td>
              <td>{me?.score}</td>
              <td>
                {me?.ready ? (
                  <span style={{ color: "green" }}>✔</span>
                ) : (
                  <button
                    className="button"
                    onClick={() => socket.emit("playerReady", roomName)}
                  >
                    Ready
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td>
                {opponent ? opponent.name : <div className="spinner"></div>}
              </td>
              <td>{opponent?.score}</td>
              <td>
                {opponent?.ready ? (
                  <span style={{ color: "green" }}>✔</span>
                ) : (
                  <div className="spinner"></div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isGameStarted && (
        <div className="start-timer">
          <h2>
            {gameState.isStarted && 0 < gameState.startTimer
              ? `Game starting in ${startTimer}...`
              : "Waiting for players..."}
          </h2>
        </div>
      )}

      {/* {isGameStarted && (
        <div>
          <div className="question-timer">
            <h2>{questionTimer ? `Question ending in ${questionTimer}...` : "Time's up!"}</h2>
          </div>
          <div className="question">
            <h2>{question ? question : ''}</h2>
          </div>
          <div className="answer">
            <form onSubmit={onSubmitAnswer}>
              <input type="text" onChange={(e) => setAnswerMe(e.target.value)} placeholder="Answer for you..." className="input"/>
              <input type="text" onChange={(e) => setAnswerOpponent(e.target.value)} placeholder="Answer for opponent..." className="input"/>
              <button className="button" type="submit" disabled={submitDisabled}>Submit</button>
            </form>
          </div>
        </div>
      )} */}

      <div>
        <button className="button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default QuizzerScreen;
