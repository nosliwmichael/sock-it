const Answer = require('./answer');

module.exports = class Question {
    /**
     * @param {string} question 
     */
    constructor(question) {
        /**
         * @type {string}
         */
        this.question = question;
        /**
         * @type {Map<string, Answer>}
         */
        this.answers = new Map();
    }
};