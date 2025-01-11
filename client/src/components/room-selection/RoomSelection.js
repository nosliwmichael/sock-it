import React, { useEffect, useState } from 'react';
import './RoomSelection.css';
import Quizzer from '../quiz-random/Quizzer';
import { useSocket } from '../context/SocketContext';

const RoomSelectionScreen = ({ gameMode }) => {
  const [greeting, setGreeting] = useState('');
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState('');

  const { currentSocket: socket } = useSocket();

  const onSubmit = (e) => {
    e.preventDefault();
    handleJoinRoom(roomName);
  };

  const handleJoinRoom = () => {
    if (roomName.trim()) {
      socket.emit('joinRoom', { room: roomName, playerName: playerName });
      setIsSubmitted(true);
    }
  };

  useEffect(() => {
    socket.on('welcome', (message) => {
      setGreeting(message); // Update state with the received welcome message
    });

    return () => {
      socket.off('welcome'); // Clean up the event listener
    };
  });

  if (isSubmitted && roomName) {
    if (gameMode.name === 'Quizzer') {
      return <Quizzer roomName={roomName} />;
    }
    else if (gameMode.name === 'Quiz Me') {
      // return <QuizMe roomName={roomName} />;
    }
  }

  return (
    <div className="RoomSelectionScreen">
      <header className="header">
        <h1>{greeting}</h1>
      </header>
      <form onSubmit={onSubmit}>
        <input
          className="input"
          type="text"
          value={roomName}
          required="true"
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
        <input
          className="input"
          type="text"
          value={playerName}
          required="true"
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