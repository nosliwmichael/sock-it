import React, { useState } from 'react';
import './RoomSelection.css';

const RoomSelectionScreen = ({ welcomeMessage, socket }) => {
  const [roomName, setRoomName] = useState('');

  const handleJoinRoom = () => {
    if (roomName.trim()) {
      socket.emit('joinRoom', { room: roomName });
      console.log(`Joining room: ${roomName}`);
    }
  };

  return (
    <div className="RoomSelectionScreen">
      <header className="App-header">
        <h1>{welcomeMessage}</h1>
      </header>
      <div>
        <input
          className="App-input"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
        <div className='App-container'>
          <button className="App-button" onClick={handleJoinRoom}>Join Room</button>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionScreen;