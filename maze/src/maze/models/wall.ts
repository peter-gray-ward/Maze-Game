import * as THREE from 'three';
import { MapSite } from './map-site';
import { Maze, IMaze } from '../singletons/levels/maze';
import { Room } from './room';
import { Game } from '../singletons/game';
import { Side } from './side';
import { DirectionType } from '../constants/direction';
import * as style from '../utils/style';


export class Wall extends Side {

    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, rooms: Room[], direction: DirectionType) {
        super(game, id, position, rotation, width, height, depth, color, text, rooms, direction);
        this.direction = direction;
    }

    override Build(): void {
        super.Build();
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth, 5, 5),
            new THREE.MeshStandardMaterial({
                map: style.wallpaperTexture,
                color: 'white',
                side: THREE.DoubleSide
            })
        );
        wall.position.copy(this.position);
        wall.name = "wall-" + this.id.join(",");
        this.scene = wall;
    }

    static WallBuilder = class extends MapSite.MapSiteBuilder {
        public _direction!: number;
        public _rooms: Room[] = [];

        direction(direction: DirectionType): this {
            this._direction = direction;
            return this;
        }

        rooms(roomA: Room, roomB: Room): this {
            this._rooms.push(roomA, roomB);
            return this;
        }

        build(): Wall {
            return new Wall(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text, this._rooms, this._direction as DirectionType);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}
