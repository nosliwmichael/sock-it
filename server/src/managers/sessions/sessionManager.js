const lobbyManager = require("./lobbyManager");
const quizzerManager = require("./quizzerManager");
const quizMeManager = require("./quizMeManager");

let lobby;
let quizzer;
let quizMe;

module.exports = (io) => {
    lobby = lobbyManager(io);
    quizzer = quizzerManager(io);
    quizMe = quizMeManager(io);
};