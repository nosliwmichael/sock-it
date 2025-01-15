import { Player } from './player.js';
import { Question } from './question.js';

export class Room {
    public name: string;
    public players: Map<string, Player>;
    public questions: Array<Question>;
    public currentQuestion: Question | null;
    public isAnswering: boolean;

    constructor(name: string) {
        this.name = name;
        this.players = new Map();
        this.questions = [];
        this.currentQuestion = null;
        this.isAnswering = false;
    }
};