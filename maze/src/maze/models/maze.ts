import { Room } from './room';
import { Wall } from './wall';
import { Side } from './side';
import { Direction } from '../constants/direction';
import { Game } from '../singletons/game';
import * as THREE from 'three';

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
        this.outside = new Room.RoomBuilder()
            .game(this.game)
            .id([new Date().getTime()])
            .position(new THREE.Vector3(Infinity, Infinity, Infinity))
            .width(Infinity)
            .height(Infinity)
            .depth(Infinity)
            .color("black")
            .text(`Outside`)
            .build()

        const roomWidth = 2880;
        const roomHeight = 2180;
        const roomDepth = 2880;

        for (var x = 0; x < dimensions; x++) {
            for (var y = 0; y < dimensions; y++) {
                this.AddRoom(
                    new Room.RoomBuilder()
                        .game(this.game)
                        .id([x, y])
                        .position(new THREE.Vector3(x * roomWidth, 0, y * roomHeight))
                        .width(roomWidth)
                        .height(roomHeight)
                        .depth(roomDepth)
                        .color("white")
                        .text(`Room (${x}, ${y})`)
                        .build()
                );
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
                    .position(new THREE.Vector3(x * roomWidth, 0, (y - 0.5) * roomHeight))
                    .width(roomWidth)
                    .height(roomHeight)
                    .depth(roomDepth)
                    .direction(Direction.North)
                    .rooms(roomA, this.getAdjacentRoom(x, y - 1))
                    .color("gray")
                    .text("North Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.East]))
                    .position(new THREE.Vector3((x + 0.5) * roomWidth, 0, y * roomHeight))
                    .width(roomDepth)
                    .height(roomHeight)
                    .depth(roomDepth)
                    .direction(Direction.East)
                    .rooms(roomA, this.getAdjacentRoom(x + 1, y))
                    .color("gray")
                    .text("East Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.South]))
                    .position(new THREE.Vector3(x * roomWidth, 0, (y + 0.5) * roomHeight))
                    .width(roomWidth)
                    .height(roomHeight)
                    .depth(roomDepth)
                    .direction(Direction.South)
                    .rooms(roomA, this.getAdjacentRoom(x, y + 1))
                    .color("gray")
                    .text("South Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.West]))
                    .position(new THREE.Vector3((x - 0.5) * roomWidth, 0, y * roomHeight))
                    .width(roomDepth)
                    .height(roomHeight)
                    .depth(roomDepth)
                    .direction(Direction.West)
                    .rooms(roomA, this.getAdjacentRoom(x - 1, y))
                    .color("gray")
                    .text("West Wall")
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