import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MapSite } from './map-site';
import { Direction, DirectionType } from '../constants/direction';
import { Side } from './side';
import { Floor } from './floor';
import { Ceiling } from './ceiling';
import { Door } from './door';
import { Wall } from './wall';
import { CeilingLight, Light } from './light';
import { Game } from '../singletons/game';
import { BookShelf } from './book-shelf';

export class Room extends MapSite {
    floor!: Floor;
    ceiling!: Ceiling;
    lights: Light[] = [];
    visited: boolean = false;

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }


    SetSide(dir: DirectionType, side: Side) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof Side && (this.children[i] as Side).direction == dir) {
                this.children[i] = side;
            }
        }
    }

    GetSide(dir: DirectionType) {
        for (let child of this.children) {
            if (child instanceof Side && child.direction == dir) {
                return child;
            }
        }
        return null;
    }

    override Build() {
        if (!this.children.find(child => child instanceof Door)) return;

        super.Build();
        
        // Floor
        this.floor = new Floor.FloorBuilder()
            .game(this.game)
            .id(this.id.concat([0]))
            .position(this.position.clone())
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color('blue')
            .text("I'm a floor!")
            .build();
        this.floor.Build();
        this.scene.add(this.floor.scene);

        // Ceiling
        this.ceiling = new Ceiling.CeilingBuilder()
            .game(this.game)
            .id(this.id.concat([0]))
            .position(this.position.clone().add(new THREE.Vector3(0, this.height, 0)))
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color('blue')
            .text("I'm a ceiling!")
            .build();
        this.ceiling.Build();
        this.scene.add(this.ceiling.scene);

        // Ceiling Light
        this.lights.push(
            new CeilingLight.LightBuilder()
            .game(this.game)
            .id(this.id.concat([5]))
            .position(this.ceiling.position.clone().add(new THREE.Vector3(0, -20, 0)))
            .width(this.width)
            .height(12)
            .depth(this.depth)
            .color(`rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`)
            .text("I'm a light!")
            .build()
        );

        for (let light of this.lights) {
            light.Build();
            this.scene.add(light.scene);
        }
        
        // Walls
        let setBookshelf = false;
        for (let s of this.children) {
            if (s instanceof Side) {
                let side: Side = s instanceof Wall ? 
                    new Wall.WallBuilder()
                        .game(this.game)
                        .id(this.id.concat([s.direction]))
                        .position(this.position.clone().add(new THREE.Vector3(0, this.height / 2, 0)))
                        .width(this.width)
                        .height(this.height)
                        .depth(12)
                        .color('blue')
                        .text("I'm a wall!")
                        .build()
                    : new Door.DoorBuilder()
                        .game(this.game)
                        .id(this.id.concat([s.direction]))
                        .position(this.position.clone().add(new THREE.Vector3(0, this.height / 2, 0)))
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
                        side.scene.translateX(this.width / 2);
                        side.scene.rotateY(Math.PI / 2);
                        break;
                    case Direction.North:
                        side.scene.translateX(-this.width / 2);
                        side.scene.rotateY(Math.PI / 2);
                        break;
                    default:
                        break;
                }
                
                this.scene.add(side.scene);

                if (!setBookshelf && s instanceof Wall) {
                    setBookshelf = true; // Prevent multiple bookshelf creation

                    // BookShelves (3 per wall)
                    let halfHeight = this.height / 2;
                    for (let i = 1; i < 2; i++) {

                        let bookshelfBoardWidth: number = 1;
                        let bookshelfWidth: number = this.width / 3 - bookshelfBoardWidth;
                        let bookshelfHeight: number = Math.random() * (this.height - halfHeight) + halfHeight;

                        // Calculate bookshelf position along the wall
                        let bookshelfPositionX = s.position.x + (i - 1) * (this.width / 3); // Adjust for 3 bookshelves
                        let bookshelfPositionY = bookshelfHeight / 2; // Set at a reasonable height
                        let bookshelfPositionZ = s.position.z; // Keep the same z-depth
                        let bookshelfDepth = 12;
                        let bookshelf: BookShelf = new BookShelf.BookShelfBuilder()
                            .game(this.game)
                            .id(this.id.concat([0, i]))
                            .position(new THREE.Vector3(bookshelfPositionX, bookshelfPositionY, bookshelfPositionZ))
                            .width(bookshelfWidth)
                            .height(bookshelfHeight)
                            .depth(bookshelfDepth)
                            .color('brown')
                            .text("I'm a bookshelf!")
                            .build();

                        bookshelf.Build();

                        let offset = bookshelfDepth + bookshelfBoardWidth;
                        // Adjust bookshelf placement based on the wall's direction
                        switch (s.direction) {
                            case Direction.East:
                                bookshelf.scene.translateZ(this.depth / 2);
                                bookshelf.scene.translateX(offset);
                                break;
                            case Direction.West:
                                bookshelf.scene.translateZ(-this.depth / 2);
                                bookshelf.scene.translateX(-offset);
                                break;
                            case Direction.South:
                                bookshelf.scene.translateX(this.width / 2);
                                bookshelf.scene.rotateY(Math.PI / 2);
                                bookshelf.scene.translateZ(-offset);
                                break;
                            case Direction.North:
                                bookshelf.scene.translateX(-this.width / 2);
                                bookshelf.scene.rotateY(Math.PI / 2);
                                bookshelf.scene.translateZ(offset);
                                break;
                            default:
                                break;
                        }

                        this.scene.add(bookshelf.scene);
                    }
                }

            }
        }

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
        private _floor!: Floor;
        private _lights: Light[] = [];

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
