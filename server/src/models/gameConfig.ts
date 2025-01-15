export enum GameType {
    QUIZZER,
    QUIZME
}

export class GameConfig {
    public name: string;
    public gameType: GameType;
    public maxPlayers: number
    public maxRounds: number;
    public roundTimeout: number;

    constructor(
        name: string,
        gameType: GameType, 
        maxPlayers: number, 
        maxRounds: number, 
        roundTimeout: number) {
            this.name = name;
            this.gameType = gameType;
            this.maxPlayers  = maxPlayers;
            this.maxRounds = maxRounds;
            this.roundTimeout = roundTimeout;
    }
}