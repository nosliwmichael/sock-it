import { QuizzerAnswer } from "../../models/answer.js";
import { GameConfig } from "../../models/gameConfig.js";
import { Player } from "../../models/player.js";
import { Question } from "../../models/question.js";
import { QuizzerStateManager } from "../state/quizzerStateManager.js";

export class QuizzerRoomsManager {
    private config: GameConfig;
    private rooms: Map<string, QuizzerStateManager>;

    constructor(config: GameConfig) {
        this.config = config;
        this.rooms = new Map();
    }

    join(roomName: string, player: Player): boolean {
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new QuizzerStateManager(this.config));
        }
        let room = this.rooms.get(roomName);
        return room ? room.join(player) : false;
    }

    leave(roomName: string, playerId: string): boolean {
        let room = this.rooms.get(roomName);
        return room ? room.leave(playerId) : false;
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
        return room ? room.getPlayers().every(p => p.ready) : false;
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