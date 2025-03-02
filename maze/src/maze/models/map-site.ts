import * as THREE from 'three';
import { Game } from '../singletons/game';

export abstract class MapSite {
    public color: string = "transparent";
    public text: string = "";
    public id: number[] = [];
    public scene: THREE.Group = new THREE.Group();
    public box: THREE.Box3 | null = null;
    public game: Game;
    public active: boolean = false;
    public width!: number;
    public height!: number;
    public depth!: number;
    public position!: THREE.Vector3;

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        this.game = game;
        this.id = id;
        this.position = position;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.text = text;
    }

    static MapSiteBuilder = class {
        public _game!: Game;
        public _id!: number[];
        public _position!: THREE.Vector3;
        public _width!: number;
        public _height!: number;
        public _depth!: number;
        public _color: string = "transparent";
        public _text: string = "";

        game(game: Game): this {
            this._game = game;
            return this;
        }

        id(id: number[]): this {
            this._id = id;
            return this;
        }

        position(position: THREE.Vector3): this {
            this._position = position;
            return this;
        }

        width(width: number): this {
            this._width = width;
            return this;
        }

        height(height: number): this {
            this._height = height;
            return this;
        }

        depth(depth: number): this {
            this._depth = depth;
            return this;
        }

        color(color: string): this {
            this._color = color;
            return this;
        }

        text(text: string): this {
            this._text = text;
            return this;
        }
    };

    Build() {
        this.scene.position.set(this.position.x, this.position.y, this.position.z);
        if (this.box == null) {
            this.box = new THREE.Box3(
                new THREE.Vector3(this.width / 2, this.height / 2, this.depth / 2),
                new THREE.Vector3(-this.width / 2, -this.height / 2, -this.depth / 2)
            );
        }
        this.scene.name = this.id.join('-');
    }

    abstract GetRandomTexture(): string;
    
    Act() {
        if (!this.active) {
            const childrenCopy = [...this.scene.children];
            for (let child of childrenCopy) {
                this.game.scene.add(child);
            }
        }
        this.active = true;
    }

    Remove() {
        if (this.active) {
            console.log("removing room")
            for (let child of this.scene.children) {
                this.game.scene.remove(child);
            }
        }
        this.active = false;
    }
}