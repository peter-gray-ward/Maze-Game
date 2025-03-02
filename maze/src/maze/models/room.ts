import * as THREE from 'three';
import { MapSite } from './map-site';
import { Direction } from '../constants/direction';
import { Side } from './side';
import { Floor } from './floor';
import { Wall } from './wall';
import { CeilingLight, Light } from './light';
import { Game } from '../singletons/game';

export class Room extends MapSite {
    sides: Side[] = new Array(4).fill(null);
    floor!: Floor;
    lights: Light[] = [];

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }


    SetSide(dir: number, side: Side) {
        this.sides[dir] = side;
    }

    GetSide(dir: number) {
        return this.sides[dir];
    }

    override Build() {
        super.Build();


        this.floor = new Floor.FloorBuilder()
            .game(this.game)
            .id(this.id.concat([0]))
            .position(this.position.clone().add(new THREE.Vector3(0, -this.height / 2, 0)))
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color('white')
            .text("I'm a floor!")
            .build();
        this.floor.Build();

        this.scene.add(this.floor.scene);

        const light = new THREE.AmbientLight(0xffffff, 0.1);
        // light.target.position.set(this.floor.position.x, this.floor.position.y, this.floor.position.z);
        this.lights.push(
            new CeilingLight.LightBuilder()
            .game(this.game)
            .id(this.id.concat([5]))
            .position(this.position.clone().add(new THREE.Vector3(0, this.height, 0)))
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color(`rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`)
            .text("I'm a light!")
            .light(light)
            .build()
        );

        for (let light of this.lights) {
            light.Build();
            this.scene.add(light.scene);
        }
        

        for (let side of this.sides) {
            const wall = new Wall.WallBuilder()
                .game(this.game)
                .id(this.id.concat([side.direction]))
                .position(this.position.clone())
                .width(this.width)
                .height(this.height)
                .depth(12)
                .color('white')
                .text("I'm a wall!")
                .build();
            wall.Build();
            switch (side.direction) {
                case Direction.North:
                    wall.scene.translateZ(this.depth / 2);
                    break;
                case Direction.South:
                    wall.scene.translateZ(-this.depth / 2);
                    break;
                case Direction.East:
                    wall.scene.translateX(-this.width / 2);
                    wall.scene.rotateY(Math.PI / 2);
                    break;
                case Direction.West:
                    wall.scene.translateX(this.width / 2);
                    wall.scene.rotateY(-Math.PI / 2);
                    break;
            }
            this.scene.add(wall.scene);
        }
    }

    override GetRandomTexture() {
        return "green";
    }

    static RoomBuilder = class extends MapSite.MapSiteBuilder {
        private _sides: Side[] = [];
        private _floor!: Floor;
        private _lights: Light[] = [];

        sides(sides: Side[]): this {
            this._sides = sides;
            return this;
        }

        floor(floor: Floor): this {
            this._floor = floor;
            return this;
        }

        lights(lights: Light[]): this {
            this._lights = lights;
            return this;
        }

        build(): Room {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a Floor.");
            }
            return new Room(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text);
        }
    }

}
