import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./App.css";
import RoomSelection from "./components/room-selection/RoomSelection";
import { useSocket } from "./components/providers/SocketProvider";
import { v4 as uuidv4 } from "uuid";
import GameSelection from "./components/game-selection/GameSelection";
import QuizzerScreen from "./components/quizzer/Quizzer";

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
const SESSION_ID = "SESSION_ID";

const App = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<any | undefined>(
    undefined
  );
  const [header, setHeader] = useState<string>("Welcome");
  const { setSocket } = useSocket();

  let sessionId = localStorage.getItem(SESSION_ID);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID, sessionId);
  }

  const connectSocket = (gameMode: any) => {
    setSocket(
      io(`${serverURL}:${port}${gameMode.path}`, {
        forceNew: false,
        query: {
          sessionId: sessionId,
        },
      })
    );
    setSelectedGameMode(gameMode);
    console.log("Connected socket to", gameMode.path);
  };

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
              setHeader={setHeader}
              setSelectedGameMode={connectSocket}
            />
          }
        />
        <Route
          path="/room-selection"
          element={
            <RoomSelection setHeader={setHeader} gameMode={selectedGameMode} />
          }
        />
        <Route
          path="/quizzer"
          element={<QuizzerScreen setHeader={setHeader}></QuizzerScreen>}
        ></Route>
      </Routes>
    </div>
  );
};

export default App;
