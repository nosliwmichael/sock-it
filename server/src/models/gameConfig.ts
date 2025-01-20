export enum GameType {
    QUIZZER,
    QUIZME
}

export interface GameConfig {
    name: string;
    gameType: GameType;
    maxPlayers: number
    maxRounds: number;
    roundTimeout: number;
    startTimeout: number;
}