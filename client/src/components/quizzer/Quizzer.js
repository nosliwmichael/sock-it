import React, { useState, useEffect } from 'react';
import './Quizzer.css';
import { useSocket } from '../context/SocketContext';

const QuizzerScreen = ({ roomName }) => {
  const [me, setMe] = useState('');
  const [opponent, setOpponent] = useState('');
  const [startTimer, setStartTimer] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [question, setQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState('');
  const [answerMe, setAnswerMe] = useState('');
  const [answerOpponent, setAnswerOpponent] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(false);

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

  useEffect(() => {
    const resetGame = () => {
      setOpponent('');
      setStartTimer('');
      setIsGameStarted(false);
      setQuestion('');
      setQuestionTimer('');
    };
    
    const handlePlayerUpdate = (players) => {
      setMe(null);
      setOpponent(null);
      
      new Map(players).forEach(player => {
        if (player.id === socket.id) {
          setMe(player);
        } else {
          setOpponent(player);
        }
      });
    };

    const handlePlayerLeft = (players) => {
      handlePlayerUpdate(players);
      resetGame();
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

    socket.on('playerJoined', handlePlayerUpdate);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('playerUpdate', handlePlayerUpdate);
    socket.on('startTimer', handleStartTimer);
    socket.on('question', (q) => {
      setQuestion(q);
      setSubmitDisabled(false);
    });
    socket.on('questionTimer', handleQuestionTimer);
    socket.on('gameOver', resetGame);

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off('playerJoined', handlePlayerUpdate);
      socket.off('playerLeft', handlePlayerUpdate);
      socket.off('playerUpdate', handlePlayerUpdate);
      socket.off('startTimer', handleStartTimer);
      socket.off('question', setQuestion);
      socket.off('questionTimer', handleQuestionTimer);
      socket.off('gameOver', resetGame);
    };
  }, [socket]);

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
                {me?.ready ? 
                <span style={{ color: 'green' }}>✔</span> : 
                <button className="button" onClick={() => socket.emit('playerReady', roomName)}>Ready</button>}
              </td>
            </tr>
            <tr>
              <td>{opponent ? opponent.name : <div className="spinner"></div>}</td>
              <td>{opponent?.score}</td>
              <td>
                {
                  opponent?.ready ? 
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

      {isGameStarted && (
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
      )}

    </div>
  );
};

export default QuizzerScreen;