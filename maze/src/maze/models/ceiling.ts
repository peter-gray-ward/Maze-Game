import * as THREE from 'three';
import { MapSite } from './map-site';
import { Game } from '../singletons/game';

const ceilingTexture = new THREE.TextureLoader().load("/floor.jpg", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(11, 11);
});

export class Ceiling extends MapSite {
    public floorDepth: number = 12;

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();
        this.scene.name = this.id.join(',');
        const floorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.floorDepth, this.depth),
            new THREE.MeshStandardMaterial({
                map: ceilingTexture,
                side: THREE.DoubleSide,
                wireframe: false
            })
        );
        floorMesh.position.copy(this.position);
        this.scene.add(floorMesh);
    }

    static CeilingBuilder = class extends MapSite.MapSiteBuilder {
        build(): Ceiling {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Ceiling.");
            }
            return new Ceiling(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text);
        }
    }
}
