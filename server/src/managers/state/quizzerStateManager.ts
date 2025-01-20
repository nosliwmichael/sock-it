import { randomUUID } from "crypto";
import { QuizzerAnswer } from "../../models/answer.js";
import { GameConfig } from "../../models/gameConfig.js";
import { Player } from "../../models/player.js";
import { Question } from "../../models/question.js";
import { QuizzerGameState } from "../../models/quizzerGameState.js";

export class QuizzerStateManager {
    private config: GameConfig;
    private gameState: QuizzerGameState;

    constructor(config: GameConfig, roomName: string) {
        this.config = config;
        this.gameState = {
            roomName: roomName,
            round: 0,
            players: new Map(),
            questions: [
                { id: randomUUID(), question: 'What is the capital of Texas?' },
                { id: randomUUID(), question: 'What is the capital of France?' },
                { id: randomUUID(), question: 'What is the capital of Denmark?' },
                { id: randomUUID(), question: 'What is the capital of Australia?' },
                { id: randomUUID(), question: 'What is the capital of Japan?' },
            ],
            answers: new Map(),
            isAnswering: false,
            startTimer: config.startTimeout,
            isGameStarted: false,
            roundTimer: config.roundTimeout,
            isRoundStarted: false,
        };
    }

    getState(): QuizzerGameState {
        return this.gameState;
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

    getPlayer(playerId: string): Player | undefined {
        return this.gameState.players.get(playerId);
    }

    getPlayers(): Player[] {
        return this.gameState.players.values().toArray();
    }

    setPlayerReady(playerId: string): boolean {
        let player = this.gameState.players.get(playerId);
        if (player) {
            player.ready = true;
            return true;
        }
        return false;
    }

    answerQuestion(answer: QuizzerAnswer) {
        if (!this.gameState.isAnswering) {
            return;
        }
        let question = this.gameState.questions[this.gameState.round - 1];
        let roundAnswers = this.gameState.answers.get(question.id);
        if (!roundAnswers?.size) {
            roundAnswers = new Map();
            this.gameState.answers.set(question.id, roundAnswers);
        }
        roundAnswers.set(answer.playerId, answer);
        this.gameState.answers.set(question.id, roundAnswers);
    }

    approveAnswer(playerId: string) {
        let question = this.gameState.questions[this.gameState.round - 1];
        let roundAnswers = this.gameState.answers.get(question.id);
        let answer = roundAnswers?.get(playerId);
        if (answer && roundAnswers) {
            answer.correct = true;
            roundAnswers.set(playerId, answer);
            this.gameState.answers.set(question.id, roundAnswers);
        }
    }

    calculatePoints() {
        this.gameState.players.forEach((player, playerId) => {
            player.score = 0;
            for (let i = 0; i < this.gameState.round; i++) {
                let question = this.gameState.questions[i];
                let answers = this.gameState.answers.get(question.id);
                let answer = answers?.get(playerId);
                if (answer?.correct) {
                    player.score++;
                }
            }
        });
    }

    isRoomReady(): boolean {
        return this.hasMaxPlayers() && this.arePlayersReady();
    }

    private hasMaxPlayers(): boolean {
        return this.getPlayers().length === this.config.maxPlayers;
    }

    private arePlayersReady(): boolean {
        return this.getPlayers().every(p => p.ready);
    }

    start(callback: Function) {
        console.log('Start called');
        if (!this.gameState.isGameStarted) {
            this.startGame(callback);
        }
        else if (this.gameState.isRoundStarted && this.gameState.round < this.config.maxRounds) {
            this.startRound(callback);
        } else {
            console.log(`Game Started: ${this.gameState.isGameStarted}, Round Started: ${this.gameState.isRoundStarted}, Round: ${this.gameState.round}`);
        }
    }

    private startGame(callback: Function) {
        this.gameState.startTimer = this.config.startTimeout + 1;
        this.gameState.isGameStarted = true;
        const intervalId = setInterval(() => {
            this.gameState.startTimer--;
            callback();
            if (this.gameState.startTimer === 0) {
                clearInterval(intervalId);
                this.startRound(callback);
            }
            if (!this.isRoomReady()) {
                clearInterval(intervalId);
                this.resetGame(callback);
            }
        }, 1000);
    }

    private startRound(callback: Function) {
        this.gameState.roundTimer = this.config.roundTimeout + 1;
        this.gameState.isRoundStarted = true;
        this.gameState.isAnswering = true;
        this.gameState.round++;
        const intervalId = setInterval(() => {
            this.gameState.roundTimer--;
            if (this.gameState.roundTimer === 0) {
                clearInterval(intervalId);
                this.gameState.isRoundStarted = false;
                this.gameState.isAnswering = false;
                this.gameState.players.forEach(p => p.ready = false);
                this.calculatePoints();
            }
            callback();
            if (!this.hasMaxPlayers()) {
                clearInterval(intervalId);
                this.resetGame(callback);
            }
        }, 1000);
    }

    resetGame(callback: Function) {
        this.gameState.isGameStarted = false;
        this.gameState.isRoundStarted = false;
        this.gameState.isAnswering = false;
        this.gameState.startTimer = this.config.startTimeout;
        this.gameState.roundTimer = this.config.roundTimeout;
        this.gameState.round = 0;
        this.gameState.players.forEach(p => p.score = 0);
        callback();
    }
}