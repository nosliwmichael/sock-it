import React, { useState, useEffect } from "react";
import "./Quizzer.css";
import { useSocket } from "../providers/SocketProvider";
import { useGameState } from "../providers/GameStateProvider";
import { Player } from "../../models/player";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../providers/HeaderProvider";

interface QuizzerScreenProps {
}

const QuizzerScreen: React.FC<QuizzerScreenProps> = (props) => {
  const { socket } = useSocket();
  const { gameState, setGameState } = useGameState();
  const { setHeader } = useHeader();
  const [me, setMe] = useState<Player | undefined>(undefined);
  const [opponent, setOpponent] = useState<Player | undefined>(undefined);
  const [isLeaveRoom, setIsLeaveRoom] = useState<boolean>(false);

  const navigate = useNavigate();

  const myPlayerId = localStorage.getItem("myPlayerId");

  const leaveRoom = (e: React.MouseEvent) => {
    socket.emit("leaveRoom");
    setIsLeaveRoom(true);
    setGameState(undefined);
  };

  useEffect(() => {
    setHeader(`Quizzer: ${gameState?.roomName} Room`);
  }, [gameState]);

  useEffect(() => {
    if (isLeaveRoom) {
      navigate("/");
    }
  }, [isLeaveRoom, navigate]);

  useEffect(() => {
    setMe(undefined);
    setOpponent(undefined);
    if (myPlayerId) {
      gameState?.players.forEach((v, k) => {
        if (k === myPlayerId) {
          setMe(v);
        } else {
          setOpponent(v);
        }
      });
    }
  }, [gameState]);

  useEffect(() => {
    if (!socket.hasListeners("stateChange")) {
      socket.on("stateChange", setGameState);
    }
    return () => {
      socket.off("stateChange");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit('requestState');
    }
  }, [socket]);

  return (
    <div className="QuizzerScreen">
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
                    onClick={() =>
                      socket.emit("playerReady", gameState?.roomName)
                    }
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

      {!gameState?.isStarted && (
        <div>
          <h2>Waiting on players...</h2>
        </div>
      )}

      {gameState?.isStarted && 0 < gameState.startTimer && (
        <div className="start-timer">
          <h2>Game starting in {gameState.startTimer}...</h2>
        </div>
      )}

      {gameState?.isStarted && 0 === gameState.startTimer && (
        <div>
          <div className="question-timer">
            <h2>{gameState.roundTimer > 0 ? `Question ending in ${gameState.roundTimer}...` : "Time's up!"}</h2>
          </div>
          <div className="question">
            <h2>{gameState.round > 0 ? gameState.questions[gameState.round].question : ''}</h2>
          </div>
          {/* <div className="answer">
            <form onSubmit={onSubmitAnswer}>
              <input type="text" onChange={(e) => setAnswerMe(e.target.value)} placeholder="Answer for you..." className="input" />
              <input type="text" onChange={(e) => setAnswerOpponent(e.target.value)} placeholder="Answer for opponent..." className="input" />
              <button className="button" type="submit" disabled={submitDisabled}>Submit</button>
            </form>
          </div> */}
        </div>
      )}

      <div>
        <button className="button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default QuizzerScreen;
