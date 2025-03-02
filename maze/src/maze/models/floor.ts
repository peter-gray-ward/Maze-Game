import * as THREE from 'three';
import { MapSite } from './map-site';
import { Game } from '../singletons/game';

const floorTexture = new THREE.TextureLoader().load("/floor.jpg");

export class Floor extends MapSite {
    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        this.scene.name = this.id.join(',');
        const floorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, 12, this.depth),
            new THREE.MeshStandardMaterial({
                map: floorTexture,
                side: THREE.DoubleSide,
                wireframe: false
            })
        );
        floorMesh.receiveShadow = true;
        floorMesh.castShadow = true;
        floorMesh.position.copy(this.position);
        this.scene.add(floorMesh);
    }

    static FloorBuilder = class extends MapSite.MapSiteBuilder {
        build(): Floor {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new Floor(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text);
        }
    }
}
