import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'
import RoomSelection from './components/room-selection/RoomSelection';
import { useSocket } from './components/context/SocketContext';

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;

const App = () => {
  const [greeting, setGreeting] = useState('');
  const [gameModes, setGameModes] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState(null);

  const { currentSocket: socket, setSocket } = useSocket();

  // Listen for the 'gameModes' event from the server
  useEffect(() => {
    socket.on('welcome', (message) => {
      setGreeting(message); // Update the state with the received welcome message
    });

    socket.on('gameModes', (gameModes) => {
      setGameModes(gameModes); // Update state with the received game modes
    });

    return () => {
      socket.off('welcome'); // Clean up the event listener
      socket.off('gameModes'); // Clean up the event listener
    };
  }, [socket]);

  const handleButtonClick = (gameMode) => {
    socket.disconnect();
    setSocket(io(`${serverURL}:${port}${gameMode.path}`));

    setSelectedGameMode(gameMode); // Set the selected game mode
  };

  if (selectedGameMode) {
    return <RoomSelection gameMode={selectedGameMode}/>;
  }

  return (
    <div className="App">
      <header className="header">
        <h1>{greeting || 'Welcome'}</h1>
      </header>
      <div className="button-container">
        {gameModes.map((gameMode, index) => (
          <button key={index} className="button" onClick={() => handleButtonClick(gameMode)}>
          {gameMode.name}
        </button>
        ))}
      </div>
    </div>
  );
};

export default App;
