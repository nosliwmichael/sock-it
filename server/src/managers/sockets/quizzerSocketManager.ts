import { Namespace, Server, Socket } from 'socket.io';
import { GameType } from "../../models/gameConfig.js";
import { QuizzerSessionsManager, Session } from '../sessions/quizzerSessionsManager.js';
import { randomUUID } from 'crypto';
import { Player } from '../../models/player.js';
import { QuizzerGameState } from '../../models/quizzerGameState.js';
import { send } from 'process';

const GameName = 'Quizzer';
const SocketNamspace = '/quizzer';

enum EventListeners {
    Connection = 'connection',
    JoinRoom = 'joinRoom',
    PlayerReady = 'playerReady',
    LeaveRoom = 'leaveRoom',
    RequestState = 'requestState',
    Disconnect = 'disconnect',
}

enum EventEmitters {
    NewPlayerId = 'newPlayerId',
    SuccessfullyJoinedRoom = 'successfullyJoinedRoom',
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
            this.requestStateEvent(socket);
            this.leaveRoomEvent(socket);
            this.disconnectEvent(socket);
        });
    }

    createPlayer(socket: Socket) {
        const sessionId = socket.handshake.query.sessionId as string;
        let session = this.gameSessionsManager.getSession(sessionId);
        if (session) {
            console.log(`${session.playerId} reconnected to ${GameName}...`);
            this.joinRoom(socket, session, {});
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
            const session = this.demandSession(socket);
            this.joinRoom(socket, session, data);
        });
    }

    joinRoom(socket: Socket, session: Session, data: any) {
        let roomName: string = data.room;
        let player: Player = {
            id: session.playerId, name: data.playerName, score: 0, ready: false
        };
        if (session.roomName) {
            console.log('Session already has a room', session.roomName);
            roomName = session.roomName;
            let existingPlayer = this.gameSessionsManager.getPlayer(session.roomName, session.playerId);
            if (existingPlayer) {
                console.log('Session already has a player', existingPlayer);
                player = existingPlayer;
            }
        }
        this.gameSessionsManager.setRoomToSession(session.sessionId, roomName);
        let playerJoined = this.gameSessionsManager.join(roomName, player);
        if (playerJoined) {
            socket.join(roomName);
            session.roomName = roomName;
            socket.emit(EventEmitters.SuccessfullyJoinedRoom, {
                isSuccessful: true,
                roomName: roomName,
            });
            let state = this.sendState(session);
            console.log(`Current players in room ${roomName}:`, state?.players);
        } else {
            socket.emit(EventEmitters.SuccessfullyJoinedRoom, {
                isSuccessful: false,
                roomName: roomName,
            });
        }
    }

    playerReadyEvent(socket: Socket) {
        socket.on(EventListeners.PlayerReady, () => {
            const session = this.demandSession(socket);
            if (!session.roomName) {
                return;
            }
            const isPlayerReady = this.gameSessionsManager.setPlayerReady(session.roomName, session.playerId);
            if (isPlayerReady) {
                console.log(`${session.playerId} is ready!`);
                this.sendState(session);
                if (this.gameSessionsManager.isRoomReady(session.roomName)) {
                    let countdown = 15;
                    const intervalId = setInterval(() => {
                        countdown--;
                        if (session.roomName) {
                            this.io.in(session.roomName).emit(EventEmitters.StartTimer, countdown);
                        }
                        if (countdown === 0) {
                            clearInterval(intervalId);
                        }
                    }, 1000);
                }
            }
        });
    }

    requestStateEvent(socket: Socket) {
        socket.on(EventListeners.RequestState, () => {
            const session = this.demandSession(socket);
            this.sendState(session);
        });
    }

    sendState(session: Session): QuizzerGameState | undefined {
        if (session.roomName) {
            const state = this.gameSessionsManager.getState(session.roomName);
            this.io.in(session.roomName).emit(EventEmitters.StateChange, state);
            return state;
        }
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
                this.leaveRoom(session, true);
            }, 30000);
            this.disconnectTimers.set(session.playerId, timerId);
        });
    }

    leaveRoom(session: Session, isDisconnected: boolean = false) {
        if (this.gameSessionsManager.leave(session, isDisconnected)) {
            console.log('Left room', session.roomName, session.playerId);
            let state = this.sendState(session);
            console.log(`Current players in room ${session.roomName}:`, state?.players);
            session.roomName = undefined;
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