const lobbyManager = require("./lobbyManager");
const quizRandomManager = require("./quizRandomManager");
const quizTurnManager = require("./quizTurnManager");

let lobby;
let quizRandom;
let quizTurns;

module.exports = (io) => {
    lobby = lobbyManager(io);
    quizRandom = quizRandomManager(io);
    quizTurns = quizTurnManager(io);
};