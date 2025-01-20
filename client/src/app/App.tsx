import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import RoomSelection from "../features/room-selection/RoomSelection";
import { useSocket } from "../providers/SocketProvider";
import { v4 as uuidv4 } from "uuid";
import GameSelection from "../features/game-selection/GameSelection";
import QuizzerScreen from "../features/quizzer/Quizzer";
import { useHeader } from "../providers/HeaderProvider";

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
const SESSION_ID = "SESSION_ID";

const App = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<any | undefined>(
    undefined
  );
  const { header } = useHeader();
  const [socketConnectionPath, setSocketConnectionPath] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem(SESSION_ID));
  const { setSocket } = useSocket();

  if (!sessionId) {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_ID, newSessionId);
  }

  const selectGame = useCallback((gameMode: any) => {
    setSelectedGameMode(gameMode);
    setSocketConnectionPath(gameMode.path);
  }, []);

  useEffect(() => {
    if (socketConnectionPath?.trim().length) {
      const socketConnectionUrl = `${serverURL}:${port}${socketConnectionPath}`;
      console.log('Connecting to...', socketConnectionUrl);
      setSocket(io(socketConnectionUrl, {
        forceNew: false,
        query: {
          sessionId: sessionId,
        },
      }));
    }
  }, [sessionId, setSocket, socketConnectionPath]);

  return (
    <div className="App">
      <header className="header">
        <h1>{header}</h1>
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <GameSelection
              setSelectedGameMode={selectGame}
            />
          }
        />
        <Route
          path="/room-selection"
          element={
            <RoomSelection gameMode={selectedGameMode} />
          }
        />
        <Route
          path="/quizzer"
          element={<QuizzerScreen></QuizzerScreen>}
        ></Route>
      </Routes>
    </div>
  );
};

export default App;
