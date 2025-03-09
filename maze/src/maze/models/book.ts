import * as THREE from 'three';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';

export interface IBook {
	id: number;
	title: string;
	authors: any[];
	sumaries: string[];
	subjects: string[];
	bookshelves: string[];
	languages: string[];
	formats: {
		[key: string]: string
	}[];
};

export const MaxBookHeight: number = 12;
export const BookHeight = (): number => Math.random() * (MaxBookHeight / 2) + (MaxBookHeight / 2);


export class Book extends MapSite {
	public book: IBook;


	constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, book: IBook) {
        super(game, id, position, width, height, depth, color, text);
        this.book = book;
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();
        const bookGeometry = new THREE.BoxGeometry(this.depth, this.height, this.width);
        const bookMaterial = new THREE.MeshStandardMaterial({ 
        	color: this.color,
        	side: THREE.DoubleSide 
        });
        const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
        bookMesh.position.copy(this.position);


        this.scene = bookMesh

        this.scene.name = 'no-collision';
        
    }

    static BookBuilder = class extends MapSite.MapSiteBuilder {
    	public _book: IBook = {} as IBook;

    	book(_book: IBook) {
    		this._book = _book;
    	}
        build(): Book {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined || this._book === undefined) {
                throw new Error("Missing required properties to create a Book.");
            }
            return new Book(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text, this._book);

        }
    }
}