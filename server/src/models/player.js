export default class Player {
    /**
     * 
     * @param {string} id 
     * @param {string} name 
     */
    constructor(id, name) {
        /**
         * @type {string}
         */
        this.id = id;
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {number}
         */
        this.score = 0;
        /**
         * @type {boolean}
         */
        this.ready = false;
    }
};