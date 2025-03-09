import * as THREE from "three";
import { Book, BookHeight, MaxBookHeight } from './book';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';

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
        this.scene.name = this.id.join(',');

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

        for (let i = 0; i < shelfCount; i++) {
            // Create a shelf
            let shelfY = (i * MaxBookHeight) - halfHeight;
            let shelf = new THREE.Mesh(
                new THREE.BoxGeometry(this.width, 1, this.depth),
                new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: mahoganyTexture })
            );
            shelf.position.copy(this.position.clone().add(new THREE.Vector3(0, shelfY, 0)));
            this.scene.add(shelf);

            // **Add Books on this shelf**
            let remainingWidth = this.width; 
            let shelfStart = shelf.position.x - halfWidth;
            let bookX = shelfStart;
            let bookCount = 0;
            
            let j = 0;
            while (remainingWidth) {
                let colors = ['maroon', 'royalblue', 'darkgreen', 'yellow', 'deeppurple', 'burgandy', 'white'];
                let bookColor = colors[Math.floor(Math.random() * colors.length)];
                let bookWidth = Math.floor(Math.random() * (MaxBookHeight / 3) + (MaxBookHeight / 3));
                let bookHeight = Math.floor(Math.random() * (MaxBookHeight / 2) + (MaxBookHeight / 2));
                let bookDepth = Math.floor(Math.random() * 3 + 1);

                if (remainingWidth - bookDepth < 0) break;

                let book = new Book.BookBuilder()
                    .game(this.game)
                    .id(this.id.concat([i]))
                    .position(new THREE.Vector3(
                        bookX + bookDepth, 
                        shelf.position.y + bookHeight / 2, 
                        this.position.z + (Math.abs(this.depth - bookWidth))
                    ))
                    .width(bookWidth)
                    .height(bookHeight)
                    .depth(bookDepth)
                    .color(bookColor)
                    .text("Random Book")
                    .build();

                

                book.Build();

                this.scene.add(book.scene);

                bookX += bookDepth;
                remainingWidth -= bookDepth;
            }
        }

        
        this.scene.add(bookshelf);
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