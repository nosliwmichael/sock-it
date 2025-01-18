import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./components/providers/SocketProvider";
import { GameStateProvider } from "./components/providers/GameStateProvider";
import { BrowserRouter } from "react-router-dom";
import { HeaderProvider } from "./components/providers/HeaderProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <HeaderProvider>
    <SocketProvider>
      <GameStateProvider>
        <BrowserRouter>
          {/* <React.StrictMode> */}
          <App />
          {/* </React.StrictMode> */}
        </BrowserRouter>
      </GameStateProvider>
    </SocketProvider>
  </HeaderProvider>
);
