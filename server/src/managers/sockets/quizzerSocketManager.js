"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const answer_1 = __importDefault(require("../../models/answer"));
const player_1 = __importDefault(require("../../models/player"));
const question_1 = __importDefault(require("../../models/question"));
const gameSessionManager_1 = __importDefault(require("../events/gameSessionManager"));
const GameName = 'Quizzer';
const questions = [
    new question_1.default('What is the capital of France?'),
    new question_1.default('What is the capital of Italy?'),
    new question_1.default('What is the capital of Spain?'),
    new question_1.default('What is the capital of Germany?'),
    new question_1.default('What is the capital of the United States?'),
];
exports.default = (io) => {
    new QuizzerSocketManager(io);
};
class QuizzerSocketManager {
    constructor(io) {
        this.io = io.of('/quizzer');
        this.gameSessionManager = new gameSessionManager_1.default({
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
    joinRoomEvent(socket) {
        socket.on('joinRoom', (data) => {
            const { room: roomName, playerName } = data;
            let room = this.gameSessionManager.joinRoom(roomName, new player_1.default(socket.id, playerName));
            if (room) {
                socket.join(roomName);
                socket.emit('roomFull', false);
                this.io.in(roomName).emit('playerJoined', Array.from(room.players.entries()));
                console.log(`Current players in room ${roomName}:`, room.players);
            }
            else {
                socket.emit('roomFull', true);
            }
        });
    }
    playerReadyEvent(socket) {
        socket.on('playerReady', () => {
            let isPlayerReady = this.gameSessionManager.setPlayerReady(socket.id);
            if (isPlayerReady) {
                console.log(`${socket.id} is ready!`);
                const roomName = this.gameSessionManager.playerRoomMap.get(socket.id);
                const room = roomName ? this.gameSessionManager.rooms.get(roomName) : null;
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
    answerEvent(socket) {
        socket.on('answer', (data) => {
            var _a;
            const { roomName, answers } = data;
            let room = this.gameSessionManager.rooms.get(roomName);
            if (room && room.isAnswering) {
                let answer = new answer_1.default(socket.id, answers[0], answers[1]);
                (_a = room.currentQuestion) === null || _a === void 0 ? void 0 : _a.answers.set(socket.id, answer);
                console.log(`Answer received from ${socket.id}:`, answer);
            }
        });
    }
    disconnectEvent(socket) {
        socket.on('disconnect', () => {
            const room = this.gameSessionManager.leaveRoom(socket.id);
            if (room) {
                console.log('Left room', room.name, socket.id);
                console.log(`Current players in room ${room.name}:`, room.players);
                this.io.in(room.name).emit('playerLeft', Array.from(room.players.entries()));
            }
        });
    }
    startGame(room) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Starting game in room ${room.name}...`);
            this.io.in(room.name).emit('startGame', 'Game starting...');
            room.questions = getQuestions();
            yield countdownEvent(5, 1000, (t) => this.io.in(room.name).emit('startTimer', t));
            for (let i = 0; i < room.questions.length; i++) {
                if (!checkPlayersReady(room.players, this.gameSessionManager.config.maxPlayers)) {
                    this.io.in(room.name).emit('gameOver', 'Player left');
                    break;
                }
                console.log(`Asking question ${i + 1}...`);
                room.currentQuestion = room.questions[i];
                this.io.in(room.name).emit('question', room.currentQuestion.question);
                room.isAnswering = true;
                yield countdownEvent(this.gameSessionManager.config.roundTimeout, 1000, (t) => this.io.in(room.name).emit('questionTimer', t));
                room.isAnswering = false;
            }
        });
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
function checkPlayersReady(players, maxPlayers) {
    return players.size == maxPlayers && Array.from(players.values()).every(player => player.ready);
}
function getQuestions() {
    return questions;
}
