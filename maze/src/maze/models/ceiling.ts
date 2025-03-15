import * as THREE from 'three';
import { MapSite } from './map-site';
import { Game } from '../singletons/game';
import * as style from '../utils/style';


export class Ceiling extends MapSite {
    public floorDepth: number = 12;

    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, rotation, width, height, depth, color, text);
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();

        const ceilingMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.floorDepth, this.depth),
            new THREE.MeshStandardMaterial({
                map: style.wallpaperTexture,
                side: THREE.DoubleSide,
                wireframe: false
            })
        );
        ceilingMesh.position.copy(this.position);
        ceilingMesh.name = "ceiling|" + this.id.join(',');
        
        this.scene = ceilingMesh;
    }

    static CeilingBuilder = class extends MapSite.MapSiteBuilder {
        build(): Ceiling {
            return new Ceiling(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text);
        }
    }
}
