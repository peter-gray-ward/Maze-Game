import * as THREE from 'three';
import { Game } from '../singletons/game';

export abstract class MapSite {
    color: string = "transparent";
    text: string = "";
    id: number[] = [];
    scene: THREE.Group = new THREE.Group;
    box: THREE.Box3 | null = null;
    game: Game;

    constructor(game: Game, id: number[]) {
        this.id = id;
        this.game = game;
    }

    Build(position: THREE.Vector3, width: number, height: number, depth: number) {
        this.scene.position.set(position.x, position.y, position.z);
        if (this.box == null) {
            this.box = new THREE.Box3(
                new THREE.Vector3(width / 2, height / 2, depth / 2),
                 new THREE.Vector3(-width / 2, -height / 2, -depth / 2)
            );
        }
    }

    abstract GetRandomTexture(): string;
}