import { QuizzerAnswer } from "../../models/answer.js";
import { GameConfig } from "../../models/gameConfig.js";
import { Player } from "../../models/player.js";
import { Question } from "../../models/question.js";
import { QuizzerStateManager } from "../state/quizzerStateManager.js";

interface Session {
    playerId: string,
    roomName?: string
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

    getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    getPlayerFromSession(sessionId: string): string | undefined {
        return this.sessions.get(sessionId)?.playerId;
    }

    setPlayerToSession(sessionId: string, playerId: string) {
        let session = this.sessions.get(sessionId);
        if (session) {
            session.playerId = playerId;
        } else {
            this.sessions.set(sessionId, { playerId: playerId });
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
            this.rooms.set(roomName, new QuizzerStateManager(this.config));
        }
        let room = this.rooms.get(roomName);
        if (room) {
            return room.getPlayer(player.id) ? true : room.join(player);
        }
        return false;
    }

    leave(sessionId: string, playerId: string, roomName: string): boolean {
        const room = this.rooms.get(roomName);
        if (sessionId) {
            this.sessions.delete(sessionId);
        }
        console.log('Leaving room', roomName);
        return room ? room.leave(playerId) : false;
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
        return room ? 
            room.getPlayers().length === this.config.maxPlayers && room.getPlayers().every(p => p.ready) : 
            false;
    }

    getCurrentQuestion(roomName: string): Question | null {
        let room = this.rooms.get(roomName);
        return room ? room.getCurrentQuestion() : null;
    }

    getNextQuestion(roomName: string): Question | null {
        let room = this.rooms.get(roomName);
        return room ? room.getNextQuestion() : null;
    }

    answerQuestion(roomName: string, answer: QuizzerAnswer) {
        let room = this.rooms.get(roomName);
        room?.answerQuestion(answer);
    }

    markAnswerCorrect(roomName: string, playerId: string) {
        let room = this.rooms.get(roomName);
        room?.markAnswerCorrect(playerId);
    }

    calculatePoints(roomName: string) {
        let room = this.rooms.get(roomName);
        room?.calculatePoints();
    }
}