import { randomUUID } from "crypto";
import { QuizzerAnswer } from "../../models/answer.js";
import { GameConfig } from "../../models/gameConfig.js";
import { Player } from "../../models/player.js";
import { Question } from "../../models/question.js";
import { QuizzerGameState } from "../../models/quizzerGameState.js";
import { QuizzerStateManager } from "../state/quizzerStateManager.js";

export interface Session {
    playerId: string,
    roomName?: string,
    sessionId: string,
}

export class QuizzerSessionsManager {
    private config: GameConfig;
    private rooms: Map<string, QuizzerStateManager>;
    private sessions: Map<string, Session>;

    constructor(config: GameConfig) {
        this.config = config;
        this.rooms = new Map();
        this.sessions = new Map();
    }

    getState(roomName: string): QuizzerGameState | undefined {
        let room = this.rooms.get(roomName);
        return room ? room.getState() : undefined;
    }

    getSession(sessionId: string): Session | null {
        const session = this.sessions.get(sessionId);
        if (session) {
            return session;
        }
        return null;
    }

    getPlayerFromSession(sessionId: string): string | undefined {
        return this.sessions.get(sessionId)?.playerId;
    }

    setPlayerToSession(sessionId: string, playerId: string) {
        let session = this.sessions.get(sessionId);
        if (session) {
            session.playerId = playerId;
        } else {
            this.sessions.set(sessionId, { playerId: playerId, roomName: '', sessionId: sessionId });
        }
    }

    setRoomToSession(sessionId: string, roomName: string) {
        let session = this.sessions.get(sessionId);
        if (session) {
            session.roomName = roomName;
        }
    }

    join(roomName: string, player: Player): boolean {
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new QuizzerStateManager(this.config, roomName));
        }
        let room = this.rooms.get(roomName);
        if (room) {
            return room.getPlayer(player.id) ? true : room.join(player);
        }
        return false;
    }

    leave(session: Session, isDisconnected: boolean = false): boolean {
        if (isDisconnected && session.sessionId) {
            this.sessions.delete(session.sessionId);
        }
        if (session.roomName) {
            const room = this.rooms.get(session.roomName);
            return room ? room.leave(session.playerId) : false;
        }
        return false;
    }

    getPlayer(roomName: string, playerId: string): Player | undefined {
        let room = this.rooms.get(roomName);
        return room ? room.getPlayer(playerId) : undefined;
    }

    getPlayers(roomName: string): Player[] {
        let room = this.rooms.get(roomName);
        return room ? room.getPlayers() : [];
    }

    setPlayerReady(roomName: string, playerId: string): boolean {
        let room = this.rooms.get(roomName);
        return room ? room.setPlayerReady(playerId) : false;
    }

    isRoomReady(roomName: string): boolean {
        let room = this.rooms.get(roomName);
        return room ? room.isRoomReady() : false;
    }

    answerQuestion(sessionId: string, answer: QuizzerAnswer) {
        let session = this.sessions.get(sessionId);
        if (session?.roomName && session.playerId) {
            let newAnswer: QuizzerAnswer = {
                id: randomUUID(),
                playerId: session.playerId,
                myAnswer: answer.myAnswer,
                answer: answer.answer,
                correct: false,
            };
            let room = this.rooms.get(session.roomName);
            room?.answerQuestion(newAnswer);
        }
    }

    approveAnswer(sessionId: string, playerId: string) {
        let session = this.sessions.get(sessionId);
        if (session?.playerId !== playerId && session?.roomName) {
            let room = this.rooms.get(session.roomName);
            room?.approveAnswer(playerId);
        }
    }

    calculatePoints(roomName: string) {
        let room = this.rooms.get(roomName);
        room?.calculatePoints();
    }

    start(roomName: string, callback: Function) {
        let room = this.rooms.get(roomName);
        room?.start(callback)
    }
}