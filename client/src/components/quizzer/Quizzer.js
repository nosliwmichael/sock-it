import React, { useState, useEffect } from 'react';
import './Quizzer.css';
import { useSocket } from '../context/SocketContext';
import RoomSelectionScreen from '../room-selection/RoomSelection';

const QuizzerScreen = ({ roomName }) => {
  const [gameState, setGameState] = useState({});
  const [startTimer, setStartTimer] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState('');
  const [answerMe, setAnswerMe] = useState('');
  const [answerOpponent, setAnswerOpponent] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [isLeaveRoom, setIsLeaveRoom] = useState(false);

  const { currentSocket: socket } = useSocket();

  const onSubmitAnswer = (e) => {
    e.preventDefault();
    console.log('Submitting answer...');
    if (roomName.trim()) {
      console.log('Emitting answer...', roomName);
      socket.emit('answer', { roomName: roomName.trim(), answers: [answerMe.trim(), answerOpponent.trim()] });
      setSubmitDisabled(true);
    }
  };

  const leaveRoom = (e) => {
    socket.emit('leaveRoom');
    setIsLeaveRoom(true);
  };

  useEffect(() => {
    const resetGame = () => {
      setStartTimer('');
      setIsGameStarted(false);
      setQuestionTimer('');
    };

    const handleStateChange = (state) => {
      console.log('handleStateChange', state);
      let me, opponent;
      let players = new Map(state.players);
      Array.from(players).forEach(player => {
        if (player.id === socket.playerId) {
          me = player;
        } else {
          opponent = player;
        }
      });
      let newState = {me: me, opponent: opponent, ...state};
      setGameState(newState);
    };

    const handleStartTimer = (t) => {
      setStartTimer(t);
      if (0 === parseInt(t)) {
        setIsGameStarted(true);
        setQuestionTimer(15);
      }
    };

    const handleQuestionTimer = (t) => {
      setQuestionTimer(t);
      if (0 === parseInt(t)) {
        setQuestionTimer(null);
      }
    };

    socket.on('stateChange', handleStateChange);
    socket.on('startTimer', handleStartTimer);
    socket.on('questionTimer', handleQuestionTimer);
    socket.on('gameOver', resetGame);
    socket.on('reconnect', handleStateChange);

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('reconnect');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('playerUpdate');
      socket.off('startTimer');
      socket.off('question');
      socket.off('questionTimer');
      socket.off('gameOver');
    };
  }, [socket, roomName]);

  if (isLeaveRoom) {
    return <RoomSelectionScreen gameMode='Quizzer'/>;
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
              <td>{gameState?.me?.name}</td>
              <td>{gameState?.me?.score}</td>
              <td>
                {gameState?.me?.ready ? 
                <span style={{ color: 'green' }}>✔</span> : 
                <button className="button" onClick={() => socket.emit('playerReady', roomName)}>Ready</button>}
              </td>
            </tr>
            <tr>
              <td>{gameState?.opponent ? gameState.opponent.name : <div className="spinner"></div>}</td>
              <td>{gameState?.opponent?.score}</td>
              <td>
                {
                  gameState.opponent?.ready ? 
                  <span style={{ color: 'green' }}>✔</span> : <div className="spinner"></div>
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isGameStarted && (
        <div className="start-timer">
          <h2>{startTimer ? `Game starting in ${startTimer}...` : 'Waiting for players...'}</h2>
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
        <button className='button' onClick={leaveRoom}>Leave Room</button>
      </div>

    </div>
  );
};

export default QuizzerScreen;