const { io } = require("socket.io-client");
const readline = require('readline');

const baseURL = 'ws://localhost:3001';
const lobbyPath = '/lobby';
let socket;

connectTo(lobbyPath);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on('gameModes', gameModes => {
    
    console.log("Select a game mode:");
    gameModes.forEach((gameMode, index) => {
        console.log(`${index + 1}) ${gameMode.name}`);
    });

    let chooseGameMode = () => {
        rl.question(`\nEnter the number of your choice:\n`, (answer) => {
            let answerInt = parseInt(answer, 10);
            if (answerInt > 0 && answerInt <= gameModes.length) {
                let choice = gameModes[answerInt - 1];
                console.log(`\nYou selected: ${choice.name}`);
                socket.disconnect();
                connectTo(choice.path);
                rl.close();
            } else {
                console.log("Invalid choice. Please try again.");
                chooseGameMode();
            }
        });
    };
    chooseGameMode();
});

socket.on('welcome', msg => {
    console.log(msg);
});

function connectTo(path) {
    let fullPath = `${baseURL}${path}`;
    console.log('Connecting to: ', fullPath);
    socket = io(fullPath);
    socket.connect();
}