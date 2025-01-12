export default class Answer {
    private playerID: string;
    private answer1: string;
    private answer2: string;
    private correct: boolean;

    constructor(playerID: string, answer1: string, answer2: string) {
        this.playerID = playerID;
        this.answer1 = answer1;
        this.answer2 = answer2;
        this.correct = false;
    }
};