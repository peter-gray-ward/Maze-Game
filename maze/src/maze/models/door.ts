import { Side } from './side';
import { Game } from '../singletons/game';
import { Room } from './room';
import { MapSite } from './map-site';
import { DirectionType } from '../constants/direction';
import * as THREE from 'three';

export class Door extends Side {
    open: boolean = false;

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, rooms: Room[], direction: DirectionType) {
        super(game, id, position, width, height, depth, color, text);
        this.rooms = rooms;
        this.direction = direction;
    }

    override Build(): void {
        super.Build();
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.color),
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            })
        );
        door.position.copy(this.position);
        this.scene = door;
    }

    static DoorBuilder = class extends MapSite.MapSiteBuilder {
        public _rooms: Room[] = [];
        public _direction!: number;
        rooms(roomA: Room, roomB: Room) {
            this._rooms.push(roomA, roomB);
            return this;
        }
        direction(direction: DirectionType) {
            this._direction = direction;
            return this;
        }
        build(): Door {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new Door(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text, this._rooms, this._direction as DirectionType);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}
