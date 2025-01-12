import React, { useState } from 'react';
import io from 'socket.io-client';
import './App.css'
import RoomSelection from './components/room-selection/RoomSelection';
import { useSocket } from './components/context/SocketContext';

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
const gameModes = {
  Quizzer: '/quizzer',
  QuizMe: '/quiz-me',
};

const App = () => {
  const [selectedGameMode, setSelectedGameMode] = useState(null);

  const { setSocket } = useSocket();

  const handleButtonClick = (gameMode) => {
    const path = gameModes[gameMode];
    setSocket(io.connect(`${serverURL}:${port}${path}`, { forceNew: false }));
    setSelectedGameMode(gameMode); // Set the selected game mode
  };

  if (selectedGameMode) {
    return <RoomSelection gameMode={selectedGameMode}/>;
  }

  return (
    <div className="App">
      <header className="header">
        <h1>Select A Game Mode</h1>
      </header>
      <div className="button-container">
        <button className="button" onClick={() => handleButtonClick('Quizzer')}>
          Quizzer
        </button>
        <button className="button" onClick={() => handleButtonClick('QuizMe')}>
          Quiz Me
        </button>
      </div>
    </div>
  );
};

export default App;
