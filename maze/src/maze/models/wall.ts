import { Side } from './side';
import { Room } from './room';
import { Game } from '../singletons/game';

export class Wall extends Side {
    constructor(game: Game, id: number[], direction: number, roomA: Room, roomB: Room) {
        super(game, id, direction, roomA, roomB);
    }

    static WallBuilder = class {
        private _game!: Game;
        private _id!: number[];
        private _direction!: number;
        private _roomA!: Room;
        private _roomB!: Room;

        game(game: Game): this {
            this._game = game;
            return this;
        }
        id(id: number[]): this {
            this._id = id;
            return this;
        }
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
            return new Wall(this._game, this._id, this._direction, this._roomA, this._roomB);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}