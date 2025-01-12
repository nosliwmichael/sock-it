export default class GameConfig {
    public name: string;
    public maxPlayers: number
    public maxRounds: number;
    public roundTimeout: number;

    constructor(name: string, maxPlayers: number, maxRounds: number, roundTimeout: number) {
        this.name = name;
        this.maxPlayers  = maxPlayers;
        this.maxRounds = maxRounds;
        this.roundTimeout = roundTimeout;
    }
}