const Player = require('./player');
const Question = require('./question');

module.exports = class Room {
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