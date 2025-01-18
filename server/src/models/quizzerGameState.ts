import { QuizzerAnswer } from "./answer.js";
import { Player } from "./player.js";
import { Question } from "./question.js";

export interface QuizzerGameState {
    roomName: string;
    round: number;
    players: Map<string, Player>;
    questions: Question[];
    // Map<Question ID, Map<Player ID, Answer>>
    answers: Map<string, Map<string, QuizzerAnswer>>;
    isAnswering: boolean;
    startTimer: number;
    isGameStarted: boolean;
    roundTimer: number;
    isRoundStarted: boolean;
}