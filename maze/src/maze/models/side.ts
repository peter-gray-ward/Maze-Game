import { MapSite } from './map-site';
import { Room } from './room';

export class Side extends MapSite {
    roomA: Room;
    roomB: Room;
    direction: number;

    constructor(id: number[], direction: number, roomA: Room, roomB: Room) {
        super(id);
        this.direction = direction;
        this.roomA = roomA;
        this.roomB = roomB;
    }
}