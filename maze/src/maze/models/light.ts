import { MapSite } from "./map-site";
import * as THREE from 'three';
import { Game } from '../singletons/game';

export abstract class Light extends MapSite {
    public light!: THREE.Light;
}

export class CeilingLight extends Light {
    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, light: THREE.Light) {
        super(game, id, position, width, height, depth, color, text);
        this.light = this.light;
    }

    override Act() {
        this.active = true;
    }

    override Remove() {
        this.active = false;
    }

    override Build() {
        super.Build();
    }

    override GetRandomTexture(): string {
        return "green";
    }

    static LightBuilder = class extends MapSite.MapSiteBuilder {
        public _light!: THREE.Light;

        light(light: THREE.Light): this {
            this._light = light;
            return this;
        }

        build(): CeilingLight {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new CeilingLight(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text, this._light);
        }
    }
}
