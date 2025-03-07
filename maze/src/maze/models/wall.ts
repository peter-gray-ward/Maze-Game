import * as THREE from 'three';
import { MapSite } from './map-site';
import { Maze, IMaze } from './maze';
import { Room } from './room';
import { Game } from '../singletons/game';
import { Side } from './side';
import { DirectionType } from '../constants/direction';

const wallpaper = new THREE.TextureLoader().load("/floor.jpg", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
});

export class Wall extends Side {

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, rooms: Room[], direction: DirectionType) {
        super(game, id, position, width, height, depth, color, text);
        this.direction = direction;
    }

    override Build(): void {
        super.Build();
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshStandardMaterial({
                map: wallpaper,
                color: 'white',
                // wireframe: true,
                side: THREE.DoubleSide
            })
        );
        wall.receiveShadow = true;
        wall.castShadow = true;
        wall.position.copy(this.position);
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
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new Wall(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text, this._rooms, this._direction as DirectionType);
        }
    }

    override GetRandomTexture(): string {
        return "green";
    }
}
