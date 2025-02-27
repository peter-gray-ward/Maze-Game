import { MapSite } from './map-site';
import { Room } from './room';

export class Side extends MapSite {
    roomA: Room;
    roomB: Room;
    direction: number;

    constructor(direction: number, roomA: Room, roomB: Room) {
        super();
        this.direction = direction;
        this.id = roomA.roomNumber.concat(roomB.roomNumber);
        this.roomA = roomA;
        this.roomB = roomB;
    }
}