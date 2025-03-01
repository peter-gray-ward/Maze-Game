import * as THREE from 'three';

export class MapSite {
    color: string = "transparent";
    text: string = "";
    id: number[] = [];
    scene: THREE.Group = new THREE.Group;
    box: THREE.Box3 | null = null;

    constructor(id: number[]) {
        this.id = id;
    }

    Build(position: THREE.Vector3, width: number, height: number, depth: number) {
        this.scene.position.set(position.x, position.y, position.z);
        if (this.box == null) {
            this.box = new THREE.Box3(
                new THREE.Vector3(width / 2, height / 2, depth / 2),
                 new THREE.Vector3(-width / 2, -height / 2, -depth / 2)
            );
        }
        console.log(this)
    }
}