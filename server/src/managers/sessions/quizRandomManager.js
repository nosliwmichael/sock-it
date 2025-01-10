module.exports = (io) => {
    quizRandom = io.of('/quiz-random');

    registerIoEvents(quizRandom);

    return quizRandom;
}

function registerIoEvents(io) {
    io.on('connection', (socket) => {
        console.log(`${socket.id} joined Quiz Random...`);
        registerSocketEvents(socket);
    });
}

function registerSocketEvents(socket) {
    socket.emit('welcome', 'Welcome to Quiz Random!');

    socket.on('joinRoom', ({ room }) => {
        socket.join(room);
        console.log(`${socket.id} joined room: ${room}`);
    });
    
    socket.on('disconnect', () => {
        console.log(`${socket.id} left Quiz Random`);
    })
}