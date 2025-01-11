module.exports = (io) => {
    lobby = io.of('/lobby');

    registerIoEvents(lobby);

    return lobby;
};

function registerIoEvents(io) {
    io.on('connection', (socket) => {
        console.log(`${socket.id} joined the lobby`);
        registerSocketEvents(socket);
    });
}

function registerSocketEvents(socket) {
    socket.emit('welcome', "Select A Game");

    socket.emit('gameModes', [
        {
            name: 'Quizzer',
            path: '/quizzer'
        },
        {
            name: 'Quiz Me',
            path: '/quiz-me'
        }
    ]);
    socket.on('disconnect', () => {
        console.log(`${socket.id} left the lobby`);
    })
}