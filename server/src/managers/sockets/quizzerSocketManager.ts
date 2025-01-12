import { Namespace, Server, Socket } from "socket.io";
import Answer from "../../models/answer.js";
import Player from "../../models/player.js";
import Question from "../../models/question.js";
import Room from "../../models/room.js";
import GameSessionManager from "../events/gameSessionManager.js";

const GameName = 'Quizzer';
const questions = [
    new Question('What is the capital of France?'),
    new Question('What is the capital of Italy?'),
    new Question('What is the capital of Spain?'),
    new Question('What is the capital of Germany?'),
    new Question('What is the capital of the United States?'),
];

export default (io: Server) => {
    new QuizzerSocketManager(io);
}

class QuizzerSocketManager {
    private io: Namespace;
    private gameSessionManager: GameSessionManager;

    constructor(io: Server) {
        this.io = io.of('/quizzer');
        this.gameSessionManager = new GameSessionManager({
            name: GameName,
            maxPlayers: 1,
            maxRounds: 5,
            roundTimeout: 20
        });
        this.registerListeners();
    }

    registerListeners() {
        this.io.on('connection', (socket) => {
            console.log(`${socket.id} joined ${GameName}...`);
            this.joinRoomEvent(socket);
            this.playerReadyEvent(socket);
            this.answerEvent(socket);
            this.disconnectEvent(socket);
        });
    }

    joinRoomEvent(socket: Socket) {
        socket.on('joinRoom', (data) => {
            const { room: roomName, playerName } = data;
            
            let room = this.gameSessionManager.joinRoom(roomName, new Player(socket.id, playerName));
            if (room) {
                socket.join(roomName);
                socket.emit('roomFull', false);
                this.io.in(roomName).emit('playerJoined', Array.from(room.players.entries()));
                console.log(`Current players in room ${roomName}:`, room.players);
            } else {
                socket.emit('roomFull', true);
            }
        });
    }

    playerReadyEvent(socket: Socket) {
        socket.on('playerReady', () => {
            let isPlayerReady = this.gameSessionManager.setPlayerReady(socket.id);
            if (isPlayerReady) {
                console.log(`${socket.id} is ready!`);
                const roomName = this.gameSessionManager.playerRoomMap.get(socket.id);
                const room: Room | undefined | null = roomName ? this.gameSessionManager.rooms.get(roomName) : null;
                if (roomName && room) {
                    this.io.in(roomName).emit('playerUpdate', Array.from(room.players.entries()));
                }
                if (room &&
                    room.players.size === this.gameSessionManager.config.maxPlayers && 
                    Array.from(room.players.values()).every(player => player.ready)) {
                        // TODO: Start game
                }
            }
        });
    }

    answerEvent(socket: Socket) {
        socket.on('answer', (data) => {
            const { roomName, answers } = data;
            let room = this.gameSessionManager.rooms.get(roomName);
            if (room && room.isAnswering) {
                let answer = new Answer(socket.id, answers[0], answers[1]);
                room.currentQuestion?.answers.set(socket.id, answer);
                console.log(`Answer received from ${socket.id}:`, answer);
            }
        });
    }

    disconnectEvent(socket: Socket) {
        socket.on('disconnect', () => {
            const room = this.gameSessionManager.leaveRoom(socket.id)
            if (room) {        
                console.log('Left room', room.name, socket.id);
                console.log(`Current players in room ${room.name}:`, room.players);
                this.io.in(room.name).emit('playerLeft', Array.from(room.players.entries()));
            }
        });
    }

    async startGame(room: Room) {
        console.log(`Starting game in room ${room.name}...`);
        this.io.in(room.name).emit('startGame', 'Game starting...');

        room.questions = getQuestions();
        await countdownEvent(5, 1000, (t: number) => this.io.in(room.name).emit('startTimer', t));

        for (let i = 0; i < room.questions.length; i++) {
            if (!checkPlayersReady(room.players, this.gameSessionManager.config.maxPlayers)) {
                this.io.in(room.name).emit('gameOver', 'Player left');
                break;
            }
            console.log(`Asking question ${i + 1}...`);
            room.currentQuestion = room.questions[i];
            this.io.in(room.name).emit('question', room.currentQuestion.question);
            room.isAnswering = true;
            await countdownEvent(this.gameSessionManager.config.roundTimeout, 1000, (t: number) => this.io.in(room.name).emit('questionTimer', t));
            room.isAnswering = false;
        }
    }
}

function countdownEvent(start: number, interval: number, callback: Function) {
    return new Promise<void>((resolve) => {
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

function checkPlayersReady(players: Map<string, Player>, maxPlayers: number) {
    return players.size == maxPlayers && Array.from(players.values()).every(player => player.ready);
}

function getQuestions() {
    return questions;
}