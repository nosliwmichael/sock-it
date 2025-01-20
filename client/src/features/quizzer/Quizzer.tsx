import React, { useState, useEffect } from "react";
import "./Quizzer.css";
import { useSocket } from "../../providers/SocketProvider";
import { useGameState } from "../../providers/GameStateProvider";
import { Player } from "../../types/player";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../../providers/HeaderProvider";

const QuizzerScreen: React.FC = () => {
  const { socket } = useSocket();
  const { gameState, setGameState } = useGameState();
  const { setHeader } = useHeader();
  const [me, setMe] = useState<Player | undefined>(undefined);
  const [opponent, setOpponent] = useState<Player | undefined>(undefined);
  const [opponentAnswer, setOpponentAnswer] = useState<string | undefined>(undefined);
  const [answerForm, setAnswerForm] = useState({
    answer: '',
    opponentAnswer: ''
  });
  const [isLeaveRoom, setIsLeaveRoom] = useState<boolean>(false);

  const navigate = useNavigate();

  const myPlayerId = localStorage.getItem("myPlayerId");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnswerForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    let answer = {
      answer: answerForm.opponentAnswer,
      myAnswer: answerForm.answer,
    }
    socket.emit('answerQuestion', answer);
  };

  const approveAnswer = (e: React.MouseEvent) => {
    socket.emit('approveAnswer', opponent?.id);
  };

  const leaveRoom = (e: React.MouseEvent) => {
    socket.emit("leaveRoom");
    setIsLeaveRoom(true);
    setGameState(undefined);
  };

  useEffect(() => {
    setHeader(`Quizzer: ${gameState?.roomName} Room`);
  }, [gameState, setHeader]);

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
    if (gameState && opponent && gameState?.answers) {
      let round = gameState.round === 0 ? 0 : gameState.round - 1;
      let questionId = gameState.questions[round].id;
      let answer = gameState.answers.get(questionId)?.get(opponent.id)?.answer;
      setOpponentAnswer(answer);
    }
  }, [gameState, myPlayerId, opponent]);

  useEffect(() => {
    if (!socket.hasListeners("stateChange")) {
      socket.on("stateChange", setGameState);
    }
    return () => {
      socket.off("stateChange");
    };
  }, [socket, setGameState]);

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

      {!gameState?.isGameStarted && (
        <div>
          <h2>Waiting on players...</h2>
        </div>
      )}

      {gameState?.isGameStarted && 0 < gameState.startTimer && (
        <div className="start-timer">
          <h2>Game starting in {gameState.startTimer}...</h2>
        </div>
      )}

      {gameState?.isGameStarted && 0 === gameState.startTimer && (
        <div>
          <div className="question-timer">
            <h2>{gameState.roundTimer > 0 ? `Question ending in ${gameState.roundTimer}...` : "Time's up!"}</h2>
          </div>
          <div className="question">
            <h2>{gameState.round > 0 ? gameState.questions[gameState.round - 1].question : ''}</h2>
          </div>
          <div className="answer">
            <form onSubmit={submitAnswer}>
              <input
                type="text"
                name="answer"
                value={answerForm.answer}
                onChange={handleInputChange}
                placeholder="Your answer to the question..."
                className="input" />
              <input
                type="text"
                name="opponentAnswer"
                value={answerForm.opponentAnswer}
                onChange={handleInputChange}
                placeholder="Guess your opponent's answer..."
                className="input" />
              <button className="button" type="submit" disabled={!gameState.isAnswering}>Submit</button>
            </form>
          </div>
        </div>
      )}

      {opponentAnswer && (
        <div>
          <p>{opponentAnswer}</p>
          <button className="button" onClick={approveAnswer}>
            Approve Answer
          </button>
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
