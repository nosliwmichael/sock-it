import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'
import RoomSelection from './components/room-selection/RoomSelection';

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
console.log(`${serverURL}${port}/lobby`);
let socket = io(`${serverURL}:${port}/lobby`); // Connect to your lobby namespace

const App = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [gameModes, setGameModes] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState(null);

  // Listen for the 'gameModes' event from the server
  useEffect(() => {
    socket.on('welcome', (message) => {
      setWelcomeMessage(message); // Update the state with the received welcome message
    });

    socket.on('gameModes', (gameModes) => {
      setGameModes(gameModes); // Update state with the received game modes
    });

    return () => {
      socket.off('welcome'); // Clean up the event listener
      socket.off('gameModes'); // Clean up the event listener
    };
  }, []);

  const handleButtonClick = (gameMode) => {
    socket.disconnect(); // Disconnect the current socket connection
    let newPath = `${serverURL}:${port}${gameMode.path}`;
    console.log(newPath);
    socket = io(newPath); // Create a new connection with the specified namespace

    socket.on('welcome', (message) => {
      setWelcomeMessage(message); // Update state with the received welcome message
    });

    setSelectedGameMode(gameMode); // Set the selected game mode
  };

  if (selectedGameMode) {
    return <RoomSelection welcomeMessage={welcomeMessage} socket={socket}/>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{welcomeMessage || 'Welcome'}</h1>
      </header>
      <div className="App-button-container">
        {gameModes.map((gameMode, index) => (
          <button key={index} className="App-button" onClick={() => handleButtonClick(gameMode)}>
          {gameMode.name}
        </button>
        ))}
      </div>
    </div>
  );
};

export default App;
