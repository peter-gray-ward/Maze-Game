import * as THREE from 'three';
import { MapSite } from './map-site';
import { Side } from './side';
import { Direction } from '../constants/direction';
import { Floor } from './floor';

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

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(width, 12, depth),
            new THREE.MeshStandardMaterial({

            })
        );

        for (var side of this.sides) {
            switch (side.direction) {
                case Direction.North:

                    break;
                case Direction.South:

                    break;
                case Direction.East:

                    break;
                case Direction.West:

                    break;
            }
        }
    }


    GetRandomTexture() {
        return "green";
    }
}