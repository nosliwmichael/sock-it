import React, { useEffect, useState } from 'react';
import './RoomSelection.css';
import Quizzer from '../quizzer/Quizzer';
import { useSocket } from '../context/SocketContext';

const RoomSelectionScreen = ({ gameMode }) => {
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState('');

  const { currentSocket: socket } = useSocket();

  const onSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      socket.emit('joinRoom', { room: roomName.trim(), playerName: playerName.trim() });
    }
  };

  useEffect(() => {
    socket.on('roomFull', (isFull) => {
      if (isFull) {
        alert('Room is full');
      }
      setIsSubmitted(!isFull);
    });

    socket.on('newPlayerId', (data) => {
      socket.playerId = data;
    });

    return () => {
      socket.off('roomFull');
      socket.off('newPlayerId');
    };
  });

  if (isSubmitted && roomName) {
    if (gameMode === 'Quizzer') {
      return <Quizzer roomName={roomName} />;
    }
    else if (gameMode === 'QuizMe') {
      // return <QuizMe roomName={roomName} />;
    }
  }

  return (
    <div className="RoomSelectionScreen">
      <header className="header">
        <h1>Welcome to {gameMode.name}</h1>
      </header>
      <form onSubmit={onSubmit}>
        <input
          className="input"
          type="text"
          value={roomName}
          required={true}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
        <input
          className="input"
          type="text"
          value={playerName}
          required={true}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
        />
        <div className='container'>
          <button className="button" type="submit">Join Room</button>
        </div>
      </form>
    </div>
  );
};

export default RoomSelectionScreen;