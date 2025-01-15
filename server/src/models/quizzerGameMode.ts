import { GameConfig } from "./gameConfig.js";
import { GameMode } from "./gameMode.js";
import { Player } from "./player.js";
import { Room } from "./room.js";

export class QuizzerGameMode implements GameMode {
    public config: GameConfig;
    public room: Room;

    constructor(config: GameConfig, room: Room) {
        this.config = config;
        this.room = room;
    }
    getPlayerRoom(playerID: string): Room {
        throw new Error("Method not implemented.");
    }
    startGame(): void {
        throw new Error("Method not implemented.");
    }

    getOrCreateRoom(roomName: string): Room {
        throw new Error("Method not implemented.");
    }

    joinRoom(roomName: string, player: Player) {
        // Initialize the room if it doesn't exist
        let room = this.rooms.get(roomName);
        if (!room) {
            room = new Room(roomName);
            this.rooms.set(roomName, room);
        }
        // Check if the room is full
        if (room.players.size === this.config.maxPlayers) {
            return null;
        }
        room.players.set(player.id, player)
        this.playerRoomMap.set(player.id, roomName);
        return room;
    }

    leaveRoom(playerID: string) {
        const roomName = this.playerRoomMap.get(playerID);
        if (roomName) {
            const room = this.rooms.get(roomName);
            if (room?.players.delete(playerID)) {
                this.playerRoomMap.delete(playerID);
                return room;
            }
        }
        return;
    }


    setPlayerReady(playerID: string) {
        const roomName = this.playerRoomMap.get(playerID);
        const room = roomName ? this.rooms.get(roomName) : null;
        if (room) {
            const player = room.players.get(playerID)
            if (player) {
                player.ready = true;
                return true;
            }
        }
        return false;
    }
}