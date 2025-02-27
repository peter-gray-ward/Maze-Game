import { Side } from './side';
import { Room } from './room';

export class Wall extends Side {
    constructor(direction: number, roomA: Room, roomB: Room) {
        super(direction, roomA, roomB);
    }

    static WallBuilder = class {
        private _direction!: number;
        private _roomA!: Room;
        private _roomB!: Room;
        direction(direction: number): this {
            this._direction = direction;
            return this;
        }
        rooms(roomA: Room, roomB: Room): this {
            this._roomA = roomA;
            this._roomB = roomB;
            return this;
        }
        build() {
            return new Wall(this._direction, this._roomA, this._roomB);
        }
    }
}