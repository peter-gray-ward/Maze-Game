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
	constructor(game: Game, model: GLTFModel) {
		super(game, [0]);
		this.model = model;
		this.model.scene.children[0].scale.set(0.4, 0.4, 0.4);
		this.box = new THREE.Box3().setFromObject(this.model.scene);
		console.log(this);
	}
	override GetRandomTexture(): string {
		return "peach";
	}
}