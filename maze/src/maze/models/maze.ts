import { Room } from './room';
import { Wall } from './wall';
import { Side } from './side';
import { Direction } from '../constants/direction';

export interface IMaze {
    rooms: Room[];
    outside: Room;
    dimensions: number;
}

export class Maze {
    rooms: Room[] = [];
    outside: Room = new Room([-1]);
    dimensions!: number;

    constructor(dimensions: number) {
        this.dimensions = dimensions;

        for (var x = 0; x < dimensions; x++) {
            for (var y = 0; y < dimensions; y++) {
                this.AddRoom(new Room([x, y]));
            }
        }

        // Initialize sides for each room
        for (var i = 0; i < this.rooms.length; i++) {
            const x = i % dimensions;
            const y = Math.floor(i / dimensions);
            const roomA = this.rooms[i];
            roomA.sides = [
                new Wall(roomA.id.concat([Direction.North]), Direction.North, roomA, this.getAdjacentRoom(x, y - 1)), // North
                new Wall(roomA.id.concat([Direction.East]), Direction.East, roomA, this.getAdjacentRoom(x + 1, y)), // East
                new Wall(roomA.id.concat([Direction.South]), Direction.South, roomA, this.getAdjacentRoom(x, y + 1)), // South
                new Wall(roomA.id.concat([Direction.West]), Direction.West, roomA, this.getAdjacentRoom(x - 1, y))  // West
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