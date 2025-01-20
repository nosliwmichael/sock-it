import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { SocketProvider } from "./providers/SocketProvider";
import { GameStateProvider } from "./providers/GameStateProvider";
import { BrowserRouter } from "react-router-dom";
import { HeaderProvider } from "./providers/HeaderProvider";

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
