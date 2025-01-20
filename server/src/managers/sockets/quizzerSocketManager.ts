import { Namespace, Server, Socket } from 'socket.io';
import { GameType } from "../../models/gameConfig.js";
import { QuizzerSessionsManager, Session } from '../sessions/quizzerSessionsManager.js';
import { randomUUID } from 'crypto';
import { Player } from '../../models/player.js';
import { QuizzerGameState } from '../../models/quizzerGameState.js';
import { QuizzerAnswer } from '../../models/answer.js';

const GameName = 'Quizzer';
const SocketNamspace = '/quizzer';

enum EventListeners {
    Connection = 'connection',
    JoinRoom = 'joinRoom',
    PlayerReady = 'playerReady',
    AnswerQuestion = 'answerQuestion',
    ApproveAnswer = 'approveAnswer',
    LeaveRoom = 'leaveRoom',
    RequestState = 'requestState',
    Disconnect = 'disconnect',
}

enum EventEmitters {
    NewPlayerId = 'newPlayerId',
    SuccessfullyJoinedRoom = 'successfullyJoinedRoom',
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
            roundTimeout: 20,
            startTimeout: 3,
        });
        this.disconnectTimers = new Map();
        this.registerListeners();
    }

    registerListeners() {
        this.io.on(EventListeners.Connection, (socket: Socket) => {
            this.createPlayer(socket);
            this.joinRoomEvent(socket);
            this.playerReadyEvent(socket);
            this.answerQuestionEvent(socket);
            this.approveAnswerEvent(socket);
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
        let playerJoined = false;
        if (roomName) {
            this.gameSessionsManager.setRoomToSession(session.sessionId, roomName);
            playerJoined = this.gameSessionsManager.join(roomName, player);
        }
        if (playerJoined) {
            socket.join(roomName);
            session.roomName = roomName;
            socket.emit(EventEmitters.SuccessfullyJoinedRoom, {
                isSuccessful: true,
                roomName: roomName,
            });
            let state = this.sendState(session);
            let players = state?.players ? Array.from(state.players).map(p => p[0]) : [];
            console.log(`Current players in room ${roomName}:`, players);
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
                    this.gameSessionsManager.start(session.roomName, () => {
                        this.sendState(session);
                    });
                }
            }
        });
    }

    answerQuestionEvent(socket: Socket) {
        socket.on(EventListeners.AnswerQuestion, (answer: QuizzerAnswer) => {
            const session = this.demandSession(socket);
            this.gameSessionsManager.answerQuestion(session.sessionId, answer);
        });
    }

    approveAnswerEvent(socket: Socket) {
        socket.on(EventListeners.ApproveAnswer, (playerId: string) => {
            const session = this.demandSession(socket);
            this.gameSessionsManager.approveAnswer(session.sessionId, playerId);
            if (session.roomName) {
                this.gameSessionsManager.calculatePoints(session.roomName);
            }
            this.sendState(session);
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
            this.io.in(session.roomName).emit(EventEmitters.StateChange, toSerializableObject(state));
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
            let players = state?.players ? Array.from(state.players).map(p => p[0]) : [];
            console.log(`Current players in room ${session.roomName}:`, players);
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

/**
 * Some types, such as Maps, are not serializable.
 * Therefore, it is necessary to convert these types to a serializable data structure before sending it to the client.
 * A Map of <string, Player> would become an Array of [[string, Player], [string, Player]].
 * The client can easily convert it back to a Map like this: new Map(mapAsArray)
 */
function toSerializableObject(obj: any): any {
    let serializableObj: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value instanceof Map) {
                serializableObj[key] = serializeMap(value);
            } else {
                serializableObj[key] = value;
            }
        }
    }
    return serializableObj;
}

function serializeMap(value: any): any {
    let newValue;
    if (value instanceof Map) {
        newValue = Array.from(value).map(([k, v]) => [k, serializeMap(v)]);
    } else {
        newValue = value;
    }
    return newValue;
}