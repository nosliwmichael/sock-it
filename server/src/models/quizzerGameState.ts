import { QuizzerAnswer } from "./answer.js";
import { Player } from "./player.js";
import { Question } from "./question.js";

export interface QuizzerGameState {
    roomName: string;
    round: number;
    players: Map<string, Player>;
    questions: Question[];
    answers: Map<string, QuizzerAnswer>[];
    isAnswering: boolean;
    startTimer: number;
    isStarted: boolean;
    roundTimer: number;
}