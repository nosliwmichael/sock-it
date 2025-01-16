import { QuizzerAnswer } from "./answer";
import { Player } from "./player";
import { Question } from "./question";

export interface GameState {
  players: Map<string, Player>;
  questions: Question[];
  answers: Map<string, QuizzerAnswer>[];
  round: number;
  isAnswering: boolean;
}
