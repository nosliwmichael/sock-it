import { Namespace, Server, Socket } from 'socket.io';
import { GameType } from "../../models/gameConfig.js";
import { QuizzerSessionsManager, Session } from '../sessions/quizzerSessionsManager.js';
import { randomUUID } from 'crypto';

const GameName = 'Quizzer';
const SocketNamspace = '/quizzer';

enum EventListeners {
    Connection = 'connection',
    Reconnect = 'reconnect',
    JoinRoom = 'joinRoom',
    PlayerReady = 'playerReady',
    LeaveRoom = 'leaveRoom',
    Disconnect = 'disconnect',
}

enum EventEmitters {
    NewPlayerId = 'newPlayerId',
    RoomFull = 'roomFull',
    StartTimer = 'startTimer',
    StateChange = 'stateChange',
}

export default (io: Server) => {
    new QuizzerSocketManager(io);
}

class QuizzerSocketManager {
    private io: Namespace;
    private gameSessionsManager: QuizzerSessionsManager;
    private disconnectTimers: Map<string, NodeJS.Timeout>;

    constructor(io: Server) {
        this.io = io.of(SocketNamspace);
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
        this.io.on(EventListeners.Connection, (socket: Socket) => {
            this.createPlayer(socket);
            this.joinRoomEvent(socket);
            this.playerReadyEvent(socket);
            this.leaveRoomEvent(socket);
            this.disconnectEvent(socket);
        });
    }

    createPlayer(socket: Socket) {
        const sessionId = socket.handshake.query.sessionId as string;
        let session = this.gameSessionsManager.getSession(sessionId);
        if (session) {
            console.log(`${session.playerId} reconnected to ${GameName}...`);
            let state = this.gameSessionsManager.getState(session.roomName);
            socket.join(session.roomName);
            socket.emit(EventListeners.Reconnect, state);
            if (this.disconnectTimers.has(session.playerId)) {
                clearTimeout(this.disconnectTimers.get(session.playerId));
                this.disconnectTimers.delete(session.playerId);
            }
        } else {
            this.gameSessionsManager.setPlayerToSession(sessionId, randomUUID());
            session = this.demandSession(socket);
            console.log(`${session.playerId} joined ${GameName} in session ${sessionId}...`);
        }
        socket.emit(EventEmitters.NewPlayerId, session.playerId);
    }

    joinRoomEvent(socket: Socket) {
        socket.on(EventListeners.JoinRoom, (data: any) => {
            const { room: roomName, playerName } = data;
            const session = this.demandSession(socket);
            this.gameSessionsManager.setRoomToSession(session.sessionId, roomName);
            let playerJoined = this.gameSessionsManager.join(roomName, {
                id: session.playerId, name: playerName, score: 0, ready: false
            });
            if (playerJoined) {
                socket.join(roomName);
                session.roomName = roomName;
                socket.emit(EventEmitters.RoomFull, false);
                let state = this.gameSessionsManager.getState(roomName);
                this.io.in(roomName).emit(EventEmitters.StateChange, JSON.stringify(state));
                console.log(`Current players in room ${roomName}:`, state?.players);
            } else {
                socket.emit(EventEmitters.RoomFull, true);
            }
        });
    }

    playerReadyEvent(socket: Socket) {
        socket.on(EventListeners.PlayerReady, () => {
            const session = this.demandSession(socket);
            const isPlayerReady = this.gameSessionsManager.setPlayerReady(session.roomName, session.playerId);
            if (isPlayerReady) {
                console.log(`${session.playerId} is ready!`);
                const state = this.gameSessionsManager.getState(session.roomName);
                this.io.in(session.roomName).emit(EventEmitters.StateChange, state);
                if (this.gameSessionsManager.isRoomReady(session.roomName)) {
                    let countdown = 15;
                    const intervalId = setInterval(() => {
                        this.io.in(session.roomName).emit(EventEmitters.StartTimer, countdown--);
                        if (countdown === 0) {
                            clearInterval(intervalId);
                        }
                    }, 1000);
                }
            }
        });
    }

    leaveRoomEvent(socket: Socket) {
        socket.on(EventListeners.LeaveRoom, () => {
            const session = this.demandSession(socket);
            console.log('Leave room');
            this.leaveRoom(session);
        });
    }

    disconnectEvent(socket: Socket) {
        socket.on(EventListeners.Disconnect, () => {
            const session = this.demandSession(socket);
            console.log(`${session.playerId} has 30 seconds to reconnect...`);

            const timerId = setTimeout(() => {
                this.leaveRoom(session);
            }, 30000);
            this.disconnectTimers.set(session.playerId, timerId);
        });
    }

    leaveRoom(session: Session) {
        if (this.gameSessionsManager.leave(session)) {
            console.log('Left room', session.roomName, session.playerId);
            let state = this.gameSessionsManager.getState(session.roomName);
            console.log(`Current players in room ${session.roomName}:`, state?.players);
            this.io.in(session.roomName).emit(EventEmitters.StateChange, state);
        } else {
            console.log('Failed to leave room', session.roomName);
        }
    }

    getSession(socket: Socket): Session | null {
        const sessionId = socket.handshake.query.sessionId as string;
        return this.gameSessionsManager.getSession(sessionId);
    }

    demandSession(socket: Socket): Session {
        const session = this.getSession(socket);
        if (session) {
            return session;
        }
        throw new Error('No session found!');
    }
}