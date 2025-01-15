import { Namespace, Server, Socket } from 'socket.io';
import { GameType } from "../../models/gameConfig.js";
import { QuizzerRoomsManager } from '../rooms/quizzerRoomsManager.js';
import { randomUUID } from 'crypto';

const GameName = 'Quizzer';

export default (io: Server) => {
    new QuizzerSocketManager(io);
}

class QuizzerSocketManager {
    private io: Namespace;
    private gameRoomsManager: QuizzerRoomsManager;

    constructor(io: Server) {
        this.io = io.of('/quizzer');
        this.gameRoomsManager = new QuizzerRoomsManager({
            name: GameName, 
            gameType: GameType.QUIZZER, 
            maxPlayers: 1, 
            maxRounds: 5, 
            roundTimeout: 20 
        });
        this.registerListeners();
    }

    registerListeners() {
        this.io.on('connection', (socket: Socket) => {
            socket.playerId = randomUUID();
            console.log(`${socket.playerId} joined ${GameName}...`);

            this.joinRoomEvent(socket);
            this.playerReadyEvent(socket);
            this.disconnectEvent(socket);
        });
    }

    joinRoomEvent(socket: Socket) {
        socket.on('joinRoom', (data: any) => {
            const { room: roomName, playerName } = data;
            let playerJoined = this.gameRoomsManager.join(roomName, {
                id: socket.playerId, name: playerName, score: 0, ready: false
            });
            if (playerJoined) {
                socket.join(roomName);
                socket.roomName = roomName;
                socket.emit('roomFull', false);
                let players = this.gameRoomsManager.getPlayers(roomName);
                this.io.in(roomName).emit('playerJoined', players);
                console.log(`Current players in room ${roomName}:`, players);
            } else {
                socket.emit('roomFull', true);
            }
        });
    }

    playerReadyEvent(socket: Socket) {
        socket.on('playerReady', () => {
            let isPlayerReady = this.gameRoomsManager.setPlayerReady(socket.roomName, socket.playerId);
            if (isPlayerReady) {
                console.log(`${socket.playerId} is ready!`);
                let players = this.gameRoomsManager.getPlayers(socket.roomName);
                if (players?.length > 0) {
                    this.io.in(socket.roomName).emit('playerUpdate', players.entries());
                }
                if (this.gameRoomsManager.isRoomReady(socket.roomName)) {
                        // Start game
                }
            }
        });
    }

    disconnectEvent(socket: Socket) {
        socket.on('disconnect', () => {
            const playerLeft = this.gameRoomsManager.leave(socket.roomName, socket.playerId)
            if (playerLeft) {        
                console.log('Left room', socket.roomName, socket.playerId);
                let players = this.gameRoomsManager.getPlayers(socket.roomName);
                console.log(`Current players in room ${socket.roomName}:`, players);
                this.io.in(socket.roomName).emit('playerLeft', players);
            }
        });
    }
}