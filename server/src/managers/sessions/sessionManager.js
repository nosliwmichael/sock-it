import lobbyManager from "./lobbyManager.js";
import quizzerManager from "./quizzerManager.js";
import quizMeManager from "./quizMeManager.js";

let lobby;
let quizzer;
let quizMe;

export default (io) => {
    lobby = lobbyManager(io);
    quizzer = quizzerManager(io);
    quizMe = quizMeManager(io);
};