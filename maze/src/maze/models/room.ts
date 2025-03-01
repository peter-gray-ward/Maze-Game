import * as THREE from 'three';
import { MapSite } from './map-site';
import { Side } from './side';
import { Direction } from '../constants/direction';
import { Floor } from './floor';
import { Game } from '../singletons/game';

export class Room extends MapSite {
    sides: Side[] = new Array(4).fill(null);

    constructor(game: Game, id: number[]) {
        super(game, id);
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
                color: new THREE.Color(Math.random(), Math.random(), Math.random())
            })
        );
        floor.receiveShadow = true;
        floor.position.copy(this.scene.position);
        console.log(this.game.scene, floor)
        this.game.scene.add(floor);

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