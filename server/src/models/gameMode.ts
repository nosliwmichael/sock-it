import { Player } from "./player.js";
import { Room } from "./room.js";

export interface GameMode {
    getOrCreateRoom(roomName: string): Room;
    joinRoom(roomName: string, player: Player): Room | null;
    leaveRoom(playerID: string): Room;
    setPlayerReady(playerID: string): boolean;
    getPlayerRoom(playerID: string): Room;
    startGame(): void;
}