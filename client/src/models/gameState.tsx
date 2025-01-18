import { QuizzerAnswer } from "./answer";
import { Player } from "./player";
import { Question } from "./question";

export interface GameState {
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
