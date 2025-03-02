import * as THREE from 'three';
import { MapSite } from './map-site';
import { Maze, IMaze } from './maze';
import { Room } from './room';
import { Game } from '../singletons/game';
import { Side } from './side';

export class Wall extends Side {
    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, rooms: Room[], direction: number) {
        super(game, id, position, width, height, depth, color, text);
        this.direction = direction;
    }

    static WallBuilder = class extends MapSite.MapSiteBuilder {
        public _direction!: number;
        public _rooms: Room[] = [];

        direction(direction: number): this {
            this._direction = direction;
            return this;
        }

        rooms(roomA: Room, roomB: Room): this {
            this._rooms.push(roomA, roomB);
            return this;
        }

        build(): Wall {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new Wall(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text, this._rooms, this._direction);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Act() {
        this.active = false;
    }

    override Remove() {
        this.active = false;
    }
}
