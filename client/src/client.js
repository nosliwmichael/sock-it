const { io } = require("socket.io-client");

const baseURL = 'ws://localhost:3001';
const path = '/quiz-random';
let socket;

connectTo(path);

function connectTo(path) {
    let fullPath = `${baseURL}${path}`;
    console.log('Connecting to: ', fullPath);
    socket = io(fullPath);
    socket.connect();
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('joinRoom', { room: 'room1', playerName: 'player1' });
    });

    socket.on('joinedRoom', (data) => {
        console.log(`Joined room event received: ${JSON.stringify(data)}`);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}