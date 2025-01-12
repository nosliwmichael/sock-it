import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SocketProvider } from './components/context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SocketProvider socket={null}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SocketProvider>
);
