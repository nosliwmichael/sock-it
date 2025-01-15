import { Answer } from './answer.js';

export class Question {
    public question: string;
    public answers: Map<string, Answer>;

    constructor(question: string) {
        this.question = question;
        this.answers = new Map();
    }
};