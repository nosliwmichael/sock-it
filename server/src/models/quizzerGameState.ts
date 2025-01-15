import { QuizzerAnswer } from "./answer.js";
import { Player } from "./player.js";
import { Question } from "./question.js";

export interface QuizzerGameState {
    players: Map<string, Player>;
    questions: Question[];
    answers: Map<string, QuizzerAnswer>[];
    round: number;
    isAnswering: boolean;
}