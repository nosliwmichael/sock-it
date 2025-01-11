import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SocketProvider } from './components/context/SocketContext';
import { io } from 'socket.io-client';

const serverURL = process.env.REACT_APP_SOCK_IT_URL;
const port = 3001;
const socketUrl = `${serverURL}:${port}`;
const lobbyUrl = `${socketUrl}/lobby`;
const socket = io(lobbyUrl);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SocketProvider socket={socket}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SocketProvider>
);
