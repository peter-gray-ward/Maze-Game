import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MapSite } from './map-site';
import { Direction, DirectionType } from '../constants/direction';
import { Side } from './side';
import { Floor } from './floor';
import { Door } from './door';
import { Wall } from './wall';
import { CeilingLight, Light } from './light';
import { Game } from '../singletons/game';

export class Room extends MapSite {
    sides: Side[] = new Array(4).fill(null);
    floor!: Floor;
    lights: Light[] = [];
    visited: boolean = false;

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }


    SetSide(dir: DirectionType, side: Side) {
        for (let i = 0; i < this.sides.length; i++) {
            if (this.sides[i].direction == dir) {
                this.sides[i] = side;
            }
        }
    }

    GetSide(dir: number) {
        return this.sides[dir];
    }

    override Build() {
        if (!this.sides.find(side => side instanceof Door)) return;

        super.Build();


        this.floor = new Floor.FloorBuilder()
            .game(this.game)
            .id(this.id.concat([0]))
            .position(this.position.clone().add(new THREE.Vector3(0, -this.height / 2, 0)))
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color('blue')
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
        

        console.log(this.sides.length)

        for (let s of this.sides) {
            let side: Side = s instanceof Wall ? 
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(this.id.concat([s.direction]))
                    .position(this.position.clone())
                    .width(this.width)
                    .height(this.height)
                    .depth(12)
                    .color('blue')
                    .text("I'm a wall!")
                    .build()
                : new Door.DoorBuilder()
                    .game(this.game)
                    .id(this.id.concat([s.direction]))
                    .position(this.position.clone())
                    .width(this.width)
                    .height(this.height)
                    .depth(12)
                    .color(s.color)
                    .text("I'm a door!")
                    .build()

            side.Build();
            switch (s.direction) {
                case Direction.East:
                    side.scene.translateZ(this.depth / 2);
                    break;
                case Direction.West:
                    side.scene.translateZ(-this.depth / 2);
                    break;
                case Direction.South:
                    side.scene.translateX(-this.width / 2);
                    side.scene.rotateY(Math.PI / 2);
                    break;
                case Direction.North:
                    side.scene.translateX(this.width / 2);
                    side.scene.rotateY(Math.PI * 1.5);
                    break;
            }
            
            if (side instanceof Door) this.scene.add(side.scene);
        }



        const boardGeometry = new THREE.BoxGeometry(30, 10.5, 0.5);
        const boardMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.copy(this.position.clone().add(new THREE.Vector3(0, -this.height / 2, 0)));
        this.scene.add(board);

        const loader = new FontLoader();
        loader.load("/helvetica.json", (font) => {
            const textGeometry = new TextGeometry(this.id.join('-'), {
                font: font,
                depth: 10
            });

            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(this.position.clone().add(new THREE.Vector3(0, -this.height / 2, 0))); // Adjust position above board
            textMesh.rotation.y = Math.random() * Math.PI * 2;

            this.scene.add(textMesh);
        });
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
