import { Side } from './side';
import { Game } from '../singletons/game';
import { Room } from './room';

export class Door extends Side {
    open: boolean = false;

    constructor(game: Game, id: number[], direction: number, roomA: Room, roomB: Room, color: string) {
        super(game, id, direction, roomA, roomB);
        this.color = color;
    }

    static DoorBuilder = class {
        private _id!: number[];
        private _direction!: number;
        private _roomA!: Room;
        private _roomB!: Room;
        private _color!: string;
        private _game!: Game;

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

        color(color: string): this {
            this._color = color;
            return this;
        }

        build(): Door {
            if (!this._game || !this._id || this._direction === undefined || !this._roomA || !this._roomB || !this._color) {
                throw new Error("Missing required properties to create a Door");
            }
            return new Door(this._game, this._id, this._direction, this._roomA, this._roomB, this._color);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}