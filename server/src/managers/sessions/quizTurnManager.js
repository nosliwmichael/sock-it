module.exports = (io) => {
    quizTurn = io.of('/quiz-turn');

    registerIoEvents(quizTurn);

    return quizTurn;
}

function registerIoEvents(io) {
    io.on('connection', (socket) => {
        console.log(`${socket.id} joined Quiz Turn...`);
        registerSocketEvents(socket);
    });
}

function registerSocketEvents(socket) {
    socket.emit('welcome', 'Welcome to Quiz Turn!');
    
    socket.on('disconnect', () => {
        console.log(`${socket.id} left Quiz Random`);
    })
}