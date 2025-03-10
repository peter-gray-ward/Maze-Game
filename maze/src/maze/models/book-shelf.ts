import * as THREE from "three";
import { IBook, Book, BookHeight, MaxBookHeight } from './book';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';
import { LibraryService } from '../singletons/services/library';

const mahoganyTexture = new THREE.TextureLoader().load("/mahogany.jpg", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 5);
});

export class BookShelf extends MapSite {
	constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }

    override GetRandomTexture(): string {
        return "green";
    }

    override Build() {
        super.Build();
        this.scene.name = "mouseable";

        let shelfCount = Math.floor(this.height / MaxBookHeight);
        const bookshelfGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const bookshelfMaterials = [
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture }), // Right
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture }), // Left
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture }), // Top
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture }), // Bottom
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture, transparent: true, opacity: 0 }), // Front (Invisible)
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture }) // Back
        ];

        // Create the bookshelf mesh
        const bookshelf = new THREE.Mesh(bookshelfGeometry, bookshelfMaterials);
        bookshelf.position.copy(this.position.clone());

        const halfHeight = this.height / 2;
        const halfWidth = this.width / 2;


        for (let i = 1; i < shelfCount; i++) {
            // Create a shelf
            let shelfY = (i * MaxBookHeight) - this.height;
            let shelf = new THREE.Mesh(
                new THREE.BoxGeometry(this.width, 1, this.depth),
                new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture })
            );
            shelf.position.copy(this.position.clone().add(new THREE.Vector3(0, shelfY, 0)));
            shelf.name = "mouseable";
            bookshelf.add(shelf);

            // **Add Books on this shelf**
            let remainingWidth = this.width; 
            let shelfStart = shelf.position.x - halfWidth;
            let bookX = shelfStart;
            let bookCount = 0;
            
            let j = 0;
            let libraryStack: IBook[] = LibraryService.libraryStack(this.game.library);
            while (remainingWidth) {
                let colors = ["#800000", "#2B1B17", "#013220", "#A67C00", "#4B0082", "#5C0002", "#E5E4E2"];
                let bookColor = colors[Math.floor(Math.random() * colors.length)];
                let bookWidth = Math.floor(Math.random() * (MaxBookHeight / 3) + (MaxBookHeight / 3));
                let bookHeight = Math.floor(Math.random() * (MaxBookHeight / 2) + (MaxBookHeight / 2));
                let bookDepth = Math.floor(Math.random() * 3 + 1);

                if (remainingWidth - bookDepth < 0) break;

                if (libraryStack.length == 0) {
                    libraryStack = LibraryService.libraryStack(this.game.library);
                }

                let libBook = this.game.library
                let book = new Book.BookBuilder()
                    .game(this.game)
                    .id(this.id.concat([i]))
                    .position(new THREE.Vector3(
                        bookX + bookDepth / 2, 
                        shelf.position.y + bookHeight / 2, 
                        this.position.z
                    ))
                    .width(bookWidth)
                    .height(bookHeight)
                    .depth(bookDepth)
                    .color(bookColor)
                    .text("Random Book")
                    .book(libraryStack.shift() as IBook)
                    .build();

                

                book.Build();

                bookshelf.add(book.scene);

                bookX += bookDepth;
                remainingWidth -= bookDepth;
            }
        }

        
        this.scene = bookshelf;
    }

    static BookShelfBuilder = class extends MapSite.MapSiteBuilder {
        build(): BookShelf {
            if (!this._game || !this._id || !this._position || this._width === undefined || this._depth === undefined) {
                throw new Error("Missing required properties to create a BookShelf.");
            }
            return new BookShelf(this._game, this._id, this._position, this._width, this._height, this._depth, this._color, this._text);
        }
    }
}