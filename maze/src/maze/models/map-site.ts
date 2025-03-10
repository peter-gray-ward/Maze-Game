import * as THREE from 'three';
import { Game } from '../singletons/game';
import { GRAVITY } from '../constants/direction';

export abstract class MapSite {
    public color: string = "transparent";
    public text: string = "";
    public id: number[] = [];
    public scene: THREE.Group | THREE.Mesh = new THREE.Group();
    public children: MapSite[] = [];
    public box!: THREE.Box3;
    public game: Game;
    public active: boolean = false;
    public width!: number;
    public height!: number;
    public depth!: number;
    public position!: THREE.Vector3;
    public rotation!: THREE.Vector3;
    public velocity: THREE.Vector3 = new THREE.Vector3(
        0,
        GRAVITY,
        0
    );
    public touchable: boolean = true;
    public friction: number = 0.0;
    public hovered: boolean = false;
    public isItem: boolean = false;

    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        this.game = game;
        this.id = id;
        this.position = position;
        this.rotation = rotation;
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
        public _rotation!: THREE.Vector3;
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

        rotation(rotation: THREE.Vector3): this {
            this._rotation = rotation;
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
        if (!this.box) {
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
            this.scene.children = childrenCopy;
        }
        this.active = true;
    }

    Remove() {
        if (this.active) {
            for (let child of this.scene.children) {
                this.game.scene.remove(child);
                this.Dispose(child as (THREE.Group | THREE.Mesh));
            }
        }
        this.active = false;
    }


    Dispose(child: THREE.Group | THREE.Mesh) {
        if (child instanceof THREE.Group) {
            for (let grandchild of child.children) {
                this.Dispose(grandchild as (THREE.Group | THREE.Mesh));
            }
        } else if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    }

    Mouseover(target: THREE.Mesh, temporary: boolean = false) {
        this.hovered = false;
        for (let child of this.scene.children) {
            if (child instanceof THREE.Box3Helper) {
                this.hovered = true;
            }
        }
        if (!this.hovered) {
            this.box.setFromObject(target);
            this.game.scene.add(new THREE.Box3Helper(this.box, 'lawngreen'));
        }
        if (temporary) {
            setTimeout(() => {
                this.Mouseleave();
            }, 5000);
        }
    }

    Mouseleave() {
        for (let child of this.scene.children) {
            if (child instanceof THREE.Box3Helper) {
                this.game.scene.remove(child);
            }
        }
        this.hovered = false;
    }
}