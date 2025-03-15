import { Room } from '../../models/room';
import { Wall } from '../../models/wall';
import { MapSite } from '../../models/map-site';
import { Side } from '../../models/side';
import { Direction } from '../../constants/direction';
import { Game } from '../game';
import { User } from '../../models/user';
import * as THREE from 'three';

export interface IMaze {
    rooms: Room[];
    outside: Room | null;
    dimensions: number;
}

export class Maze {
    shell!: { [key: string]: THREE.Mesh };
    rooms: Room[] = [];
    outside!: Room;
    dimensions!: number;
    game!: Game;
    text: string = "The Maze";
    roomWidth: number = 200;
    roomHeight: number = 200;
    roomDepth: number = 200;
    userPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

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


        for (var x = 0; x < dimensions; x++) {
            for (var y = 0; y < dimensions; y++) {
                this.AddRoom(
                    new Room.RoomBuilder()
                        .game(this.game)
                        .id([x, y])
                        .position(new THREE.Vector3(x * this.roomWidth, 0, y * this.roomWidth))
                        .width(this.roomWidth)
                        .height(this.roomHeight)
                        .depth(this.roomDepth)
                        .color("transparent")
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

            roomA.children = roomA.children.concat([
                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.North]))
                    .position(new THREE.Vector3(x * this.roomWidth, 0, y * this.roomDepth))
                    .width(this.roomWidth)
                    .height(this.roomHeight)
                    .depth(this.roomDepth)
                    .direction(Direction.North)
                    .rooms(roomA, this.getAdjacentRoom(x, y - 1))
                    .color("white")
                    .text("North Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.East]))
                    .position(new THREE.Vector3((x + 0.5) * this.roomWidth, 0, y * this.roomDepth))
                    .width(this.roomDepth)
                    .height(this.roomHeight)
                    .depth(this.roomDepth)
                    .direction(Direction.East)
                    .rooms(roomA, this.getAdjacentRoom(x + 1, y))
                    .color("white")
                    .text("East Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.South]))
                    .position(new THREE.Vector3(x * this.roomWidth, 0, y * this.roomDepth))
                    .width(this.roomWidth)
                    .height(this.roomHeight)
                    .depth(this.roomDepth)
                    .direction(Direction.South)
                    .rooms(roomA, this.getAdjacentRoom(x, y + 1))
                    .color("white")
                    .text("South Wall")
                    .build() as Side,

                new Wall.WallBuilder()
                    .game(this.game)
                    .id(roomA.id.concat([Direction.West]))
                    .position(new THREE.Vector3((x - 0.5) * this.roomWidth, 0, y * this.roomDepth))
                    .width(this.roomDepth)
                    .height(this.roomHeight)
                    .depth(this.roomDepth)
                    .direction(Direction.West)
                    .rooms(roomA, this.getAdjacentRoom(x - 1, y))
                    .color("white")
                    .text("West Wall")
                    .build() as Side
            ]);
        }
    }

    init(user: User, shell: { [key: string]: THREE.Mesh }) {
        user.activity.subscribe(user => this.userPosition.copy(user.model.scene.position));
        this.shell = shell;
    }

    private getAdjacentRoom(x: number, y: number): Room {
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

    Activate(): Room[] {
        const threshold = this.roomWidth * 5
        const activeRooms: Room[] = [];
        for (let room of this.rooms) {
            const roomNear = room.position.distanceTo(this.userPosition) < threshold;

            if (roomNear) {
                room.Act();
                activeRooms.push(room);
            } else {
                room.Remove();
            }
        }
        for (let shellType in this.shell) {
            // @ts-ignore
            const shellPositions = this.shell[shellType].geometry.attributes.position.array;
            for (let i = 0; i < shellPositions.length; i += 3) {
                const vertex = new THREE.Vector3(shellPositions[i], shellPositions[i + 1], shellPositions[i + 2]);

                if (vertex.distanceTo(this.userPosition) < threshold) {
                    // @ts-ignore
                    this.shell[shellType].geometry.attributes.color.array[i / 3 * 4 + 3] = 0;
                } else {
                    // @ts-ignore
                    this.shell[shellType].geometry.attributes.color.array[i / 3 * 4 + 3] = 1;
                }
            }
            this.shell[shellType].geometry.attributes['color'].needsUpdate = true;
        }
        return activeRooms;
    }
    
}