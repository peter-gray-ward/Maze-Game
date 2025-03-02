import * as THREE from 'three';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';

export interface GLTFModel {
	animations: any[];
	asset: any;
	cameras: any[];
	parser: any;
	scene: THREE.Group;
	scenes: THREE.Group[];
	userData: any;
}

export class User extends MapSite {
    model!: GLTFModel;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

    constructor(
        game: Game,
        id: number[],
        position: THREE.Vector3,
        width: number,
        height: number,
        depth: number,
        model: GLTFModel,
        color: string = "peach",
        text: string = ""
    ) {
        super(game, id, position, width, height, depth, color, text);
        this.model = model;
        this.init();
    }

    private init() {
        this.model.scene.children[0].scale.set(0.4, 0.4, 0.4);
        this.model.scene.position.set(0, 0, 0);
        this.box = new THREE.Box3().setFromObject(this.model.scene);
    }

    override GetRandomTexture(): string {
        return "peach";
    }

    override Act() {
        this.active = true;
    }

    override Remove() {
        this.active = false;
    }
}
