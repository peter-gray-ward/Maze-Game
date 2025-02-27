import { Room } from './room';
import { Side } from './side';
import { Direction } from '../constants/direction';

export class Maze {
    rooms: Room[] = [];
    outside: Room = new Room([-1]);

    constructor(dimensions: number) {
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
                new Side(Direction.North, roomA, this.getAdjacentRoom(x, y - 1)), // North
                new Side(Direction.East, roomA, this.getAdjacentRoom(x + 1, y)), // East
                new Side(Direction.South, roomA, this.getAdjacentRoom(x, y + 1)), // South
                new Side(Direction.West, roomA, this.getAdjacentRoom(x - 1, y))  // West
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

    RoomNumber(roomNumber: number[]) {
        return this.rooms.find(room => room.roomNumber.join(',') == roomNumber.join(','));
    }
}