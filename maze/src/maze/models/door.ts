import { Side } from './side';
import { Game } from '../singletons/game';
import { Room } from './room';
import { MapSite } from './map-site';
import { DirectionType } from '../constants/direction';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import * as style from '../utils/style';

export class Door extends Side {
    open: boolean = false;

    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, rooms: Room[], direction: DirectionType) {
        super(game, id, position, rotation, width, height, depth, color, text, rooms, direction);
        this.rooms = rooms;
        this.direction = direction;
    }

    override Build(): void {
        super.Build();
        
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshStandardMaterial({
                color: 'white',
                map: style.wallpaperTexture,
                side: THREE.DoubleSide
            })
        );
        let doorHeight = this.height / 1.5;
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(this.width / 4, doorHeight, this.depth),
            new THREE.MeshStandardMaterial({
                color: 'white',
                map: style.wallpaperTexture,
                side: THREE.DoubleSide
            })
        );
        door.position.y -= doorHeight / 2;
        wall.updateMatrix();
        door.updateMatrix();

        let wallWithDoor = CSG.subtract(wall, door);
        wallWithDoor.name = "wall|" + this.id.join(',');
        wallWithDoor.position.copy(this.position);
        this.scene = wallWithDoor;

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
            return new Door(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text, this._rooms, this._direction as DirectionType);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}
