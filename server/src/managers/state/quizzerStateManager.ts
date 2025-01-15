import { QuizzerAnswer } from "../../models/answer.js";
import { GameConfig } from "../../models/gameConfig.js";
import { Player } from "../../models/player.js";
import { Question } from "../../models/question.js";
import { QuizzerGameState } from "../../models/quizzerGameState.js";

export class QuizzerStateManager {
    private config: GameConfig;
    private gameState: QuizzerGameState;

    constructor(config: GameConfig) {
        this.config = config;
        this.gameState = {
            players: new Map(),
            questions: [],
            answers: [],
            round: 0,
            isAnswering: false
        };
    }

    join(player: Player): boolean {
        if (this.gameState.players.size === this.config.maxPlayers) {
            return false;
        }
        this.gameState.players.set(player.id, player);
        return true;
    }

    leave(playerId: string): boolean {
        return this.gameState.players.delete(playerId);
    }

    getPlayers(): Player[] {
        return this.gameState.players.values().toArray();
    }

    setPlayerReady(playerId: string): boolean {
        let player = this.gameState.players.get(playerId);
        if (player) {
            player.ready = true;
        }
        throw new Error("Player does not exist!");
    }

    getCurrentQuestion(): Question {
        return this.gameState.questions[this.gameState.round];
    }

    getNextQuestion(): Question {
        this.gameState.round++;
        return this.gameState.questions[this.gameState.round];
    }

    answerQuestion(answer: QuizzerAnswer) {
        let roundAnswers = this.gameState.answers[this.gameState.round];
        if (!roundAnswers) {
            roundAnswers = new Map();
            this.gameState.answers[this.gameState.round] = roundAnswers;
        }
        roundAnswers.set(answer.playerId, answer);
    }

    markAnswerCorrect(playerId: string) {
        let roundAnswers = this.gameState.answers[this.gameState.round];
        let answer = roundAnswers?.get(playerId);
        if (!answer) {
            throw new Error("There are no answers for this round!");
        }
        answer.correct = true;
    }

    calculatePoints() {
        this.gameState.players.forEach((player, id) => {
            player.score = 0;
            let roundAnswers = this.gameState.answers[this.gameState.round];
            if (roundAnswers.get(id)?.correct) {
                player.score += 1;
            }
        });
    }
}