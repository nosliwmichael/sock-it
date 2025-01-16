import { Namespace, Server, Socket } from 'socket.io';
import { GameType } from "../../models/gameConfig.js";
import { QuizzerSessionsManager } from '../sessions/quizzerSessionsManager.js';
import { randomUUID } from 'crypto';

const GameName = 'Quizzer';

export default (io: Server) => {
    new QuizzerSocketManager(io);
}

class QuizzerSocketManager {
    private io: Namespace;
    private gameSessionsManager: QuizzerSessionsManager;
    private disconnectTimers: Map<string, NodeJS.Timeout>;

    constructor(io: Server) {
        this.io = io.of('/quizzer');
        this.gameSessionsManager = new QuizzerSessionsManager({
            name: GameName, 
            gameType: GameType.QUIZZER, 
            maxPlayers: 2, 
            maxRounds: 5, 
            roundTimeout: 20 
        });
        this.disconnectTimers = new Map();
        this.registerListeners();
    }

    registerListeners() {
        this.io.on('connection', (socket: Socket) => {
            this.createPlayer(socket);
            this.joinRoomEvent(socket);
            this.playerReadyEvent(socket);
            this.leaveRoomEvent(socket);
            this.disconnectEvent(socket);
        });
    }

    createPlayer(socket: Socket) {
        const sessionId = socket.handshake.query.sessionId as string;
        const session = this.gameSessionsManager.getSession(sessionId);
        if (session?.roomName) {
            socket.playerId = session.playerId;
            socket.roomName = session.roomName;
            console.log(`${socket.playerId} reconnected to ${GameName}...`);
            let players = this.gameSessionsManager.getPlayers(socket.roomName);
            socket.join(session.roomName);
            socket.emit('reconnect', players);
            if (this.disconnectTimers.has(socket.playerId)) {
                clearTimeout(this.disconnectTimers.get(session.playerId));
                this.disconnectTimers.delete(socket.playerId);
            }
        } else {
            socket.playerId = randomUUID();
            this.gameSessionsManager.setPlayerToSession(sessionId, socket.playerId);
            console.log(`${socket.playerId} joined ${GameName} in session ${sessionId}...`);
        }
        socket.emit('newPlayerId', socket.playerId);
    }

    joinRoomEvent(socket: Socket) {
        socket.on('joinRoom', (data: any) => {
            const { room: roomName, playerName } = data;
            const sessionId = socket.handshake.query.sessionId as string;
            this.gameSessionsManager.setRoomToSession(sessionId, roomName);
            let playerJoined = this.gameSessionsManager.join(roomName, {
                id: socket.playerId, name: playerName, score: 0, ready: false
            });
            if (playerJoined) {
                socket.join(roomName);
                socket.roomName = roomName;
                socket.emit('roomFull', false);
                let players = this.gameSessionsManager.getPlayers(roomName);
                this.io.in(roomName).emit('playerJoined', players);
                console.log(`Current players in room ${roomName}:`, players);
            } else {
                socket.emit('roomFull', true);
            }
        });
    }

    playerReadyEvent(socket: Socket) {
        socket.on('playerReady', () => {
            let isPlayerReady = this.gameSessionsManager.setPlayerReady(socket.roomName, socket.playerId);
            if (isPlayerReady) {
                console.log(`${socket.playerId} is ready!`);
                let players = this.gameSessionsManager.getPlayers(socket.roomName);
                this.io.in(socket.roomName).emit('playerUpdate', players);
                if (this.gameSessionsManager.isRoomReady(socket.roomName)) {
                    let countdown = 15;
                    const intervalId = setInterval(() => {
                        this.io.in(socket.roomName).emit('startTimer', countdown--);
                        if (countdown === 0) {
                            clearInterval(intervalId);
                        }
                    }, 1000);
                }
            }
        });
    }

    leaveRoomEvent(socket: Socket) {
        socket.on('leaveRoom', () => {
            console.log('Leave room');
            const sessionId = socket.handshake.query.sessionId as string;
            const playerId = socket.playerId;
            const roomName = socket.roomName;
            this.leaveRoom(sessionId, playerId, roomName);
        });
    }

    disconnectEvent(socket: Socket) {
        socket.on('disconnect', () => {
            const sessionId = socket.handshake.query.sessionId as string;
            const playerId = socket.playerId;
            const roomName = socket.roomName;
            console.log(`${playerId} has 30 seconds to reconnect...`);

            const timerId = setTimeout(() => {
                this.leaveRoom(sessionId, playerId, roomName);
            }, 30000);
            this.disconnectTimers.set(playerId, timerId);
        });
    }

    leaveRoom(sessionId: string, playerId: string, roomName: string) {
        if (this.gameSessionsManager.leave(sessionId, playerId, roomName)) {
            console.log('Left room', roomName, playerId);
            let players = this.gameSessionsManager.getPlayers(roomName);
            console.log(`Current players in room ${roomName}:`, players);
            this.io.in(roomName).emit('playerLeft', players);
        } else {
            console.log('Failed to leave room', roomName);
        }
    }
}