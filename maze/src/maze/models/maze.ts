import { Room } from './room';
import { Wall } from './wall';
import { Side } from './side';
import { Direction } from '../constants/direction';
import { Game } from '../singletons/game';

export interface IMaze {
    rooms: Room[];
    outside: Room | null;
    dimensions: number;
}

export class Maze {
    rooms: Room[] = [];
    outside!: Room;
    dimensions!: number;
    game!: Game;

    constructor(game: Game, dimensions: number) {
        this.dimensions = dimensions;
        this.game = game;
        this.outside = new Room(game, [-1]);

        for (var x = 0; x < dimensions; x++) {
            for (var y = 0; y < dimensions; y++) {
                this.AddRoom(new Room(this.game, [x, y]));
            }
        }

        // Initialize sides for each room
        for (var i = 0; i < this.rooms.length; i++) {
            const x = i % dimensions;
            const y = Math.floor(i / dimensions);
            const roomA = this.rooms[i];
            roomA.sides = [
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.North]))
                    .direction(Direction.North)
                    .rooms(roomA, this.getAdjacentRoom(x, y - 1))
                    .build() as Side,
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.East]))
                    .direction(Direction.East)
                    .rooms(roomA, this.getAdjacentRoom(x + 1, y))
                    .build() as Side,
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.South]))
                    .direction(Direction.South)
                    .rooms(roomA, this.getAdjacentRoom(x, y + 1))
                    .build() as Side,
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.West]))
                    .direction(Direction.West)
                    .rooms(roomA, this.getAdjacentRoom(x - 1, y))
                    .build() as Side
            ];
        }
    }

    private getAdjacentRoom(x: number, y: number): Room {
        // Check if the room exists within the bounds of the maze
        if (x < 0 || y < 0 || x >= Math.sqrt(this.rooms.length) || y >= Math.sqrt(this.rooms.length)) {
            return this.outside; // Return outside if out of bounds
        }
        return this.rooms[x * Math.sqrt(this.rooms.length) + y]; // Calculate index based on 2D coordinates
    }

    private AddRoom(room: Room) {
        this.rooms.push(room);
    }

    RoomNumber(id: number[]) {
        return this.rooms.find(room => room.id.join(',') == id.join(','));
    }
    
}