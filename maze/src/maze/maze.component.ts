import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapSite } from './models/map-site';
import { Maze, IMaze } from './models/maze';
import { Room } from './models/room';
import { Door } from './models/door';
import { Wall } from './models/wall';
import { DirectionType, Direction, OppositeDirection, OtherDirections } from './constants/direction';
import { RoomComponent } from './components/room/room.component';
import * as THREE from 'three';
import { User, UserPosition } from './models/user';
import { Game } from './singletons/game';
import { KeyOf } from './utils/object';

@Component({
  selector: 'maze-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RoomComponent],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent {
  title: string = "maze";
  dimensions: number = 12;
  wallWidth: string = "0.15rem";
  maze: Maze;
  toggle: any = {
    map: false
  };
  user!: User;
  @ViewChild("userMarker") userMarker!: ElementRef;
  userPosition = signal({ x: 0, y: 0, z: 0, left: 0, top: 0 });
  userAnimations: any = [];
  game: Game = inject(Game);

  constructor() {
    this.maze = new Maze(this.game, this.dimensions);
    this.user = new User(
        this.game,
        [Infinity],
        new THREE.Vector3(0, 0, 0),
        -1, -1, -1,
        "peach",
        "User"
    );
  }

  ngOnInit() {
    const mazeWidth = this.maze.dimensions * this.maze.roomDepth;
    const mazeHeight = this.maze.dimensions * this.maze.roomDepth;
    const halfRoomWidth = this.maze.roomWidth / 2;
    this.user.loaded.subscribe((user: User) => {
      this.user.activity.subscribe((user: User) => {
        const mazeWidthPx = Math.min(window.innerWidth, window.innerHeight);
        const roomWidthPx = mazeWidthPx / this.maze.dimensions;
        const halfRoomWidthPx = roomWidthPx / 2;
        const halfUserMarkerPx = (+getComputedStyle(this.userMarker.nativeElement).width.split('px')[0]) / 2;
        this.userPosition.update(pos => ({
          ...pos,
          x: user.model.scene.position.x,
          y: user.model.scene.position.y,
          z: user.model.scene.position.z,
          left: mazeWidthPx
                * (
                  user.model.scene.position.z 
                  / mazeWidth
                ) + halfRoomWidthPx - halfUserMarkerPx,
          top: mazeWidthPx
               * (
                  user.model.scene.position.x 
                  / mazeHeight
               ) + halfRoomWidthPx - halfUserMarkerPx
        }));
        this.userAnimations = Object.keys(user.animations)
          .filter(animation => user.animations[animation] && user.animations[animation].speedFactor);
      });
      this.generateMaze();
      this.build3DMaze();
      this.maze.init(user);
      this.game.init(user);
    });
  }

  trackById(index: number, room: Room): string {
    return room.id.join('-');
  }

  toggleMap() {
    this.toggle.map = !this.toggle.map;
    if (!this.toggle.map) {
      this.game.renderer.domElement.style.display = 'flex';
    } else {
      this.game.renderer.domElement.style.display = 'none';
    }
  }

  generateMaze(): void {
    this.maze = new Maze(this.game, this.dimensions);

    var currentRoom = 0;
    const roomWidth = 2880;
    const roomDepth = 2880;
    const roomHeight = 2000;
    var paths = [];
    const directionStrategy: DirectionType[] = Object.keys(Direction)
      .map((key: string) => Direction[key as keyof typeof Direction]); // Trending strategy
    let currentDirectionIndex = 0;

    var filledRooms = new Set();

    for (var i = 0; i < 1; i++) {
      var path: Room[] = this.maze.rooms;
      var x: number = 0;
      while (currentRoom !== Math.pow(this.dimensions, 2) - 1) {
        let roomA: Room = path[currentRoom];
        let nextRoom: number = currentRoom;
        let direction: DirectionType = Math.random() < 0.3 ? directionStrategy[currentDirectionIndex] : directionStrategy[Math.floor(Math.random() * directionStrategy.length)]; // Get the current direction from the strategy

        if (Math.random() < 0.015) {
          direction = OppositeDirection(direction);
        }

        while (
          (direction == Direction.West && (currentRoom == 0 || currentRoom % this.dimensions == 0)) ||
          (direction == Direction.East && currentRoom % this.dimensions == this.dimensions - 1) ||
          (direction == Direction.South && currentRoom >= this.dimensions * (this.dimensions - 1)) ||
          (direction == Direction.North && currentRoom < this.dimensions) ||

          (direction == Direction.NorthWest 
            && (
              (currentRoom == 0 || currentRoom % this.dimensions == 0)
              || (currentRoom < this.dimensions)
            )
          ) ||
          (direction == Direction.NorthEast 
            && (
              (currentRoom % this.dimensions == this.dimensions - 1)
              || (currentRoom < this.dimensions)
            )
          ) ||
          (direction == Direction.SouthEast 
            && (
              (currentRoom % this.dimensions == this.dimensions - 1)
              || (currentRoom >= this.dimensions * (this.dimensions - 1))
            )
          ) ||
          (direction == Direction.SouthWest 
            && (
              (currentRoom == 0 || currentRoom % this.dimensions == 0)
              || (currentRoom >= this.dimensions * (this.dimensions - 1))
            )
          )
        ) {
          currentDirectionIndex = (currentDirectionIndex + 1) % directionStrategy.length; // Cycle through directions
          direction = directionStrategy[currentDirectionIndex];
        }

        var rand = Math.random() < 0.5;
        switch (direction) {
          case Direction.East:
            nextRoom = currentRoom + 1;
            break;
          case Direction.South:
            nextRoom = currentRoom + this.dimensions;
            break;
          case Direction.West:
            nextRoom = currentRoom - 1;
            break;
          case Direction.North:
            nextRoom = currentRoom - this.dimensions;
            break;
          case Direction.SouthEast:
            if (rand) {
              nextRoom = currentRoom + this.dimensions;
              direction = Direction.South;
            } else {
              nextRoom = currentRoom + 1;
              direction = Direction.East;
            }
            break;
          case Direction.SouthWest:
            if (rand) {
              nextRoom = currentRoom + this.dimensions;
              direction = Direction.South;
            } else {
              nextRoom = currentRoom - 1;
              direction = Direction.West;
            }
            break;
          case Direction.NorthEast:
            if (rand) {
              nextRoom = currentRoom - this.dimensions;
              direction = Direction.North;
            } else {
              nextRoom = currentRoom + 1;
              direction = Direction.East;
            }
            break;
          case Direction.NorthWest:
            if (rand) {
              nextRoom = currentRoom - this.dimensions;
              direction = Direction.North;
            } else {
              nextRoom = currentRoom - 1;
              direction = Direction.West;
            }
            break;
        }

        // Check if nextRoom is valid before accessing roomB
        if (nextRoom < path.length) {
          let roomB = path[nextRoom];

          roomA.color = "rgb(0,0,0)";
          roomB.color = "rgb(0,0,0)";


          let roomId = roomA.id.concat([direction]);
          path[currentRoom].SetSide(
            direction,
            new Door.DoorBuilder()
              .game(this.game)
              .id(roomId)
              .position(
                new THREE.Vector3(
                  roomId[0] * roomWidth, 
                  0, 
                  roomId[1] * roomDepth
                )
              )
              .width(roomWidth)
              .height(roomHeight)
              .depth(roomDepth)
              .direction(direction as DirectionType)
              .rooms(roomA, roomB) 
              .color('red')
              .text("I'm a door!")
              .build()
          );



          path[currentRoom].visited = true;

          for (let dir of OtherDirections(direction)) {
            let s = path[currentRoom].children.filter(s => s instanceof Wall && s.direction == dir);
            if (s.length) {
              s[0].color = 'blue';
            }
          }

          const oppositeDirection = OppositeDirection(direction);
          roomId = roomB.id.concat([oppositeDirection])
          path[nextRoom].SetSide(
            oppositeDirection,
            new Door.DoorBuilder()
              .game(this.game)
              .id(roomId)
              .position(
                new THREE.Vector3(
                  roomId[0] * roomWidth, 
                  0, 
                  roomId[1] * roomDepth
                )
              )
              .width(roomWidth)
              .height(roomHeight)
              .depth(roomDepth)
              .direction(OppositeDirection(direction) as DirectionType)
              .rooms(roomB, roomA) 
              .color('purple')
              .text("I'm a door!")
              .build()
          );

          filledRooms.add(currentRoom);
          filledRooms.add(nextRoom);

          currentRoom = nextRoom;
          paths.push(path);
        }

        
      }
    }

    const totalRooms = Math.pow(this.dimensions, 2);
    if (totalRooms - filledRooms.size < totalRooms / 2.5) {
      return this.generateMaze();
    }

    console.log("Finished creating the maze path", this.maze);
  }

  build3DMaze(): void {
    for (let room of this.maze.rooms) {
      room.Build();
    }
    this.game.levels.push(this.maze);
  }
}
