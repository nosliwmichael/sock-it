export default class Player {
    public id: string;
    public name: string;
    public score: number;
    public ready: boolean;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.ready = false;
    }
};