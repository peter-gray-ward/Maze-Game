import * as THREE from 'three';
import { MapSite } from './map-site';
import { Side } from './side';

export class Room extends MapSite {
    sides: Side[] = new Array(4).fill(null);

    constructor(id: number[]) {
        super(id);
    }

    SetSide(dir: number, side: Side) {
        this.sides[dir] = side;
    }

    GetSide(dir: number) {
        return this.sides[dir];
    }

    override Build(position: THREE.Vector3, width: number, height: number, depth: number) {
        super.Build(position, width, height, depth);

        console.log(this.sides)
    }
}