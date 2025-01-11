export default class Answer {
    /**
     * @param {string} playerId 
     * @param {string} answer1
     * @param {string} answer2
     */
    constructor(playerId, answer1, answer2) {
        /**
         * @type {string}
         */
        this.playerId = playerId;
        /**
         * @type {string}
         */
        this.answer1 = answer1;
        /**
         * @type {string}
         */
        this.answer2 = answer2;
        /**
         * @type {boolean}
         */
        this.correct = false;
    }
};