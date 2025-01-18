import { QuizzerAnswer } from "./answer";
import { Player } from "./player";
import { Question } from "./question";

export interface GameState {
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
