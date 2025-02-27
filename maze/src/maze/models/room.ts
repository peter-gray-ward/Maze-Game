import { MapSite } from './map-site';
import { Side } from './side';

export class Room extends MapSite {
    roomNumber: number[];
    sides: Side[] = new Array(4).fill(null);

    constructor(roomNumber: number[]) {
        super();
        this.roomNumber = roomNumber;
    }

    SetSide(dir: number, side: Side) {
        this.sides[dir] = side;
    }

    GetSide(dir: number) {
        return this.sides[dir];
    }
}