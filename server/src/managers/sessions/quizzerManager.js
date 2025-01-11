import Answer from "../../models/answer.js";
import Player from "../../models/player.js";
import Question from "../../models/question.js";
import Room from "../../models/room.js";

export default (io) => {
    return new Quizzer(io).io;
}

const GameName = 'Quizzer';
const questions = [
    new Question('What is the capital of France?'),
    new Question('What is the capital of Italy?'),
    new Question('What is the capital of Spain?'),
    new Question('What is the capital of Germany?'),
    new Question('What is the capital of the United States?'),
];

class Quizzer {
    /**
     * @param {SocketIO.Server} io 
     */
    constructor(io) {
        /**
         * @type {SocketIO.Namespace}
         */
        this.io = io.of('/quizzer');
        /**
         * @type {Map<string, Room>}
         */
        this.rooms = new Map();
        this.maxPlayers = 2;
        this.questionTimeout = 20;
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

        this.joinRoomEvent(socket);

        this.playerReadyEvent(socket);

        this.answerEvent(socket);

        this.disconnectEvent(socket);
    }

    joinRoomEvent(socket) {
        socket.on('joinRoom', (data) => {
            const { room: roomName, playerName } = data;

            // Initialize the room if it doesn't exist
            if (!this.rooms.has(roomName)) {
                this.rooms.set(roomName, new Room(roomName));
            }

            // Check if the room is full
            let room = this.rooms.get(roomName);
            let isRoomFull = room.players.size === this.maxPlayers;
            socket.emit('roomFull', isRoomFull);
            if (isRoomFull) {
                return;
            }

            // Add the player to the room
            socket.join(roomName);
            room.players.set(socket.id, new Player(socket.id, playerName));
            console.log(`Current players in room ${roomName}:`, room.players);

            // Emit the updated list of players to the room
            this.io.in(roomName).emit('playerJoined', Array.from(room.players.entries()));
        });
    }

    playerReadyEvent(socket) {
        socket.on('playerReady', (roomName) => {
            let room = this.rooms.get(roomName);
            if (room.players.has(socket.id)) {
                console.log(`${socket.id} is ready!`);
                room.players.get(socket.id).ready = true;
                this.io.in(roomName).emit('playerUpdate', Array.from(room.players.entries()));
                if (room.players.size == this.maxPlayers && Array.from(room.players.values()).every(player => player.ready)) {
                    console.log('All players ready!');
                    this.startGame(room);
                }
            }
        });
    }

    answerEvent(socket) {
        socket.on('answer', (data) => {
            const { roomName, answers } = data;
            let room = this.rooms.get(roomName);
            if (room && room.isAnswering) {
                let answer = new Answer(socket.id, answers[0], answers[1]);
                room.currentQuestion.answers.set(socket.id, answer);
                console.log(`Answer received from ${socket.id}:`, answer);
            }
        });
    }

    disconnectEvent(socket) {
        socket.on('disconnect', () => {
            Array.from(this.rooms).forEach(([roomName, room]) => {
                if (room.players.has(socket.id)) {
                    room.players.delete(socket.id);
                    console.log(`Current players in room ${roomName}:`, room.players);
                    this.io.in(roomName).emit('playerLeft', Array.from(room.players.entries()));
                }
            });
        });
    }

    /**
     * @param {Room} room 
     */
    async startGame(room) {
        console.log(`Starting game in room ${room.name}...`);
        this.io.in(room.name).emit('startGame', 'Game starting...');

        room.questions = getQuestions();
        await countdownEvent(5, 1000, (t) => this.io.in(room.name).emit('startTimer', t));

        for (let i = 0; i < room.questions.length; i++) {
            if (!checkPlayersReady(room.players, this.maxPlayers)) {
                this.io.in(room.name).emit('gameOver', 'Player left');
                break;
            }
            console.log(`Asking question ${i + 1}...`);
            room.currentQuestion = room.questions[i];
            this.io.in(room.name).emit('question', room.currentQuestion.question);
            room.isAnswering = true;
            await countdownEvent(this.questionTimeout, 1000, (t) => this.io.in(room.name).emit('questionTimer', t));
            room.isAnswering = false;
        }
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

/**
 * 
 * @param {Map<string,Player>} players 
 * @param {number} maxPlayers 
 * @returns 
 */
function checkPlayersReady(players, maxPlayers) {
    return players.size == maxPlayers && Array.from(players.values()).every(player => player.ready);
}

function getQuestions() {
    return questions;
}