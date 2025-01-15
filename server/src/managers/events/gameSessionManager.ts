import { GameConfig, GameType } from '../../models/gameConfig.js';
import { GameMode } from '../../models/gameMode.js';
import { Player } from '../../models/player.js';
import { QuizzerGameMode } from '../../models/quizzerGameMode.js';
import { Room } from '../../models/room.js';

export class GameSessionsManager {
    private config: GameConfig;
    private playerRoomMap: Map<string, string>;
    private roomGameModeMap: Map<string, GameMode>;
    
    constructor(config: GameConfig) {
        this.config = config;
        this.playerRoomMap = new Map();
        this.roomGameModeMap = new Map();
    }

    joinRoom(roomName: string, player: Player): Room | null {
        let gameMode: GameMode | null = this.roomGameModeMap.has(roomName) ? this.roomGameModeMap.get(roomName) ? null;
        if (!gameMode) {
            let room = new Room(roomName);
            gameMode = createGameMode(this.config, room);
            this.roomGameModeMap.set(roomName, gameMode);
        }
        let room = gameMode.joinRoom(roomName, player);
        if (room) {
            this.playerRoomMap.set(player.id, roomName);
        }
        return room;
    }

    leaveRoom(playerID: string): Room | null {
        const roomName = this.playerRoomMap.get(playerID);
        if (roomName) {
            const gameMode = this.roomGameModeMap.get(roomName);
            this.playerRoomMap.delete(playerID);
            return gameMode ? gameMode.leaveRoom(playerID) : null;
        }
        return null;
    }
}

function createGameMode(config: GameConfig, room: Room): GameMode {
    if (config.gameType === GameType.QUIZZER) {
        return new QuizzerGameMode(config, room);
    }
    throw new Error("Game mode not supported.");
}