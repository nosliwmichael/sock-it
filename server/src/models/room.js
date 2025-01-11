import Player from './player.js';
import Question from './question.js';

export default class Room {
    /**
     * @param {string} name 
     */
    constructor(name) {
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {Map<string, Player>}
         */
        this.players = new Map();
        /**
         * @type {Array<Question>}
         */
        this.questions = [];
        /**
         * @type {Question}
         */
        this.currentQuestion = null;
        /**
         * @type {false}
         */
        this.isAnswering = false;
    }
};