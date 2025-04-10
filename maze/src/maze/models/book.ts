import * as THREE from 'three';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export interface IBook {
	id: number;
    uuid?: string;
	title: string;
	authors: any[];
	summaries: string[];
	subjects: string[];
	bookshelves: string[];
	languages: string[];
    topic: string;
	formats: {
		[key: string]: string
	};
};

export const MaxBookHeight: number = 12;
export const BookHeight = (): number => Math.random() * (MaxBookHeight / 2) + (MaxBookHeight / 2);


export class Book extends MapSite {
	public book: IBook;


	constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, book: IBook) {
        super(game, id, position, rotation, width, height, depth, color, text);
        this.book = book;
        this.isItem = true;
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();
        const bookGeometry = new THREE.BoxGeometry(this.depth, this.height, this.width, 3, 3);
        const bookMaterial = new THREE.MeshStandardMaterial({ 
        	color: this.color,
        	side: THREE.DoubleSide 
        });
        const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
        bookMesh.position.copy(this.position);
        bookMesh.geometry.computeBoundingBox();
        this.scene = bookMesh
        this.scene.name = 'no-collision|mouseable';
        
    }

    static BookBuilder = class extends MapSite.MapSiteBuilder {
    	public _book: IBook = {} as IBook;

    	book(_book: IBook) {
    		this._book = _book;
    		return this;
    	}
        build(): Book {
            return new Book(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text, this._book);

        }
    }

    
}