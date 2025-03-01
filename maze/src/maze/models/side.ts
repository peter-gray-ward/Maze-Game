import { MapSite } from './map-site';
import { Room } from './room';
import { Game } from '../singletons/game';

export abstract class Side extends MapSite {
    roomA: Room;
    roomB: Room;
    direction: number;

    constructor(game: Game, id: number[], direction: number, roomA: Room, roomB: Room) {
        super(game, id);
        this.direction = direction;
        this.roomA = roomA;
        this.roomB = roomB;
    }
}