import * as THREE from 'three';
import { MapSite } from './map-site';
import { Game } from '../singletons/game';
import * as style from '../utils/style';

let dimensions= 20;

export class Floor extends MapSite {
    public floorDepth: number = 12;

    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, rotation, width, height, depth, color, text);
        this.scene.name = "floor: " + id.join(",");
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();

        let percentNearToEnd: number = (this.id[0] + this.id[2]) / dimensions;
        
        const floorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.floorDepth, this.depth),
            new THREE.MeshStandardMaterial({
                map: style.floorTexture,
                // wireframe: true,
                color: new THREE.Color(`rgb(255,${Math.floor(255 * percentNearToEnd)},255)`),
                side: THREE.DoubleSide
            })
        );
        floorMesh.position.copy(this.position);
        floorMesh.name = "floor|" + this.id.join(',');

        this.scene = floorMesh;
    }

    static FloorBuilder = class extends MapSite.MapSiteBuilder {
        build(): Floor {
            return new Floor(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text);
        }
    }
}
