import GameConfig from '../../models/gameConfig.js';
import Player from '../../models/player.js';
import Room from '../../models/room.js';

export default class GameSessionsManager {
    public config: GameConfig;
    public rooms: Map<string, Room>;
    public playerRoomMap: Map<string, string>;
    
    constructor(config: GameConfig) {
        this.config = config;
        this.rooms = new Map();
        this.playerRoomMap = new Map();
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
            return;
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