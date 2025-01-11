module.exports = (io) => {
    return new Quizzer(io).io;
}

const GameName = 'Quizzer';
const questions = [
    { question: 'What is the capital of France?', answer: 'Paris' },
    { question: 'What is the capital of Texas?', answer: 'Austin' },
];

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.ready = false;
    }
}

class Quizzer {
    constructor(io) {
        this.io = io.of('/quizzer');
        this.rooms = new Map();
        this.registerIOListeners();
    }

    registerIOListeners() {
        this.io.on('connection', (socket) => {
            console.log(`${socket.id} joined ${GameName}...`);
            this.registerSocketListeners(socket);
        });
    }
    
    registerSocketListeners(socket) {    
        socket.emit('welcome', `Welcome to ${GameName}!`);

        joinRoomEvent(socket, this.io, this.rooms);

        playerReadyEvent(socket, this.io, this.rooms);
        
        disconnectEvent(socket, this.io, this.rooms);
    }
}

function joinRoomEvent(socket, io, rooms) {
    socket.on('joinRoom', (data) => {
        const { room, playerName } = data;

        // Initialize the room if it doesn't exist
        if (!rooms.has(room)) {
            rooms.set(room, new Map());
        }

        // Check if the room is full
        let players = rooms.get(room);
        if (players.size === 2) {
            socket.emit('roomFull', 'Room is full');
            return;
        }

        // Add the player to the room
        socket.join(room);
        players.set(socket.id, new Player(socket.id, playerName));
        console.log(`Current players in room ${room}:`, players);

        // Emit the updated list of players to the room
        io.in(room).emit('playerJoined', Array.from(players.entries()));

        if (players.size === 2) {
            io.in(room).emit('serverReady', rooms[room]);
        }
    });
}

function playerReadyEvent(socket, io, rooms) {
    socket.on('playerReady', () => {
        Array.from(rooms).forEach(([room, players]) => {
            if (players.has(socket.id)) {
                players.get(socket.id).ready = true;
                io.emit('playerUpdate', Array.from(players.entries()));
                if (players.size == 2 && Array.from(players.values()).every(player => player.ready)) {
                    console.log('All players ready!');
                    startGame(io, room, players);
                }
            }
        });
    });
}

function disconnectEvent(socket, io, rooms) {
    socket.on('disconnect', () => {
        Array.from(rooms).forEach(([room, players]) => {
            if (players.has(socket.id)) {
                players.delete(socket.id);
                console.log(`Current players in room ${room}:`, players);
                io.in(room).emit('playerLeft', Array.from(players.entries()));
            }
        });
    });
}

async function startGame(io, room, players) {
    console.log(`Starting game in room ${room}...`);
    io.in(room).emit('startGame', 'Game starting...');

    await countdownEvent(5, 1000, (t) => io.in(room).emit('startTimer', t));
    
    for (let i = 0; i < questions.length; i++) {
        if (!checkPlayersReady(players)) {
            io.in(room).emit('gameOver', 'Player left');
            break;
        }
        let question = questions[i];
        io.in(room).emit('question', question);
        await countdownEvent(15, 1000, (t) => io.in(room).emit('questionTimer', t));
    }
}

function countdownEvent(start, interval, callback) {
    return new Promise((resolve) => {
        let countdown = start + 1;
        let intervalID = setInterval(() => {
            countdown--;
            callback(countdown);
            if (countdown === 0) {
                clearInterval(intervalID);
                resolve();
            }
        }, interval);
    });
}

function checkPlayersReady(players) {
    return players.size == 2 && Array.from(players.values()).every(player => player.ready);
}