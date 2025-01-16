import { useState } from 'react';
import io from 'socket.io-client';
import './App.css'
import RoomSelection from './components/room-selection/RoomSelection';
import { useSocket } from './components/providers/SocketProvider';
import { v4 as uuidv4 } from 'uuid';

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
const gameModes = new Map()
  .set('Quizzer', '/quizzer')
  .set('QuizMe', '/quiz-me');
const SESSION_ID = 'SESSION_ID';

const App = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<string | null>(null);

  const { setSocket } = useSocket();

  let sessionId = localStorage.getItem(SESSION_ID);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID, sessionId);
  }

  const handleButtonClick = (gameMode: string) => {
    const path = gameModes.get(gameMode);
    setSocket(io(`${serverURL}:${port}${path}`, { 
      forceNew: false,
      query: {
        sessionId: sessionId
      }
    }));
    setSelectedGameMode(gameMode);
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
