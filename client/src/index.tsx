import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./components/providers/SocketProvider";
import { GameStateProvider } from "./components/providers/GameStateProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <SocketProvider>
    <GameStateProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GameStateProvider>
  </SocketProvider>
);
