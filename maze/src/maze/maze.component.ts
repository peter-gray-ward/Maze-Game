import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapSite } from './models/map-site';
import { Maze, IMaze } from './models/maze';
import { Room } from './models/room';
import { Door } from './models/door';
import { Wall } from './models/wall';
import { DirectionType, Direction, OppositeDirection } from './constants/direction';
import { RoomComponent } from './components/room/room.component';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { User, GLTFModel } from './models/user';

@Component({
  selector: 'maze-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RoomComponent],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent {
  title: string = "maze";
  dimensions: number = 23;
  wallWidth: string = "0.15rem";
  maze: IMaze = {
    rooms: [],
    outside: new Room([-1]),
    dimensions: this.dimensions
  };
  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  toggle: any = {
    map: false
  };
  user!: User;

  constructor() {
    this.maze = new Maze(this.dimensions);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.id = "view";
    document.body.appendChild(this.renderer.domElement);
  }

  ngOnInit() {
    new GLTFLoader().load("/Xbot.glb", model => {
      this.user = new User(model);
      this.user.camera.near = 0.1; 
      this.user.camera.far = 10000;
      console.log("🧍 User model loaded", this.user);
      this.generateMaze();
      this.build3DMaze();
      this.animate();
    });
  }

  animate() {
    this.renderer.render(this.scene, this.user.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }

  trackById(index: number, site: MapSite): string {
    return site.id.join(',');
  }

  toggleMap() {
    this.toggle.map = !this.toggle.map;
    if (!this.toggle.map) {
      this.renderer.domElement.style.display = 'flex';
    } else {
      this.renderer.domElement.style.display = 'none';
    }
  }

  generateMaze(): void {
    this.maze = new Maze(this.dimensions);
    var currentRoom = 0;
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

          let adjoiningColor = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;

          path[currentRoom].color = 'maroon';
          path[currentRoom].text += `,${x++}`;

          path[currentRoom].SetSide(
            direction,
            new Door.DoorBuilder()
              .id(roomA.id.concat([direction]))
              .direction(direction)
              .rooms(roomA, roomB) 
              .color(adjoiningColor)
              .build()
          );

          path[nextRoom].SetSide(
            OppositeDirection(direction),
            new Door.DoorBuilder()
              .id(roomB.id.concat([OppositeDirection(direction)]))
              .direction(OppositeDirection(direction))
              .rooms(roomB, roomA) 
              .color(adjoiningColor)
              .build()
          );

          filledRooms.add(currentRoom);
          filledRooms.add(nextRoom);

          currentRoom = nextRoom;
          paths.push(path);
        }
      }

      path[currentRoom].color = 'aliceblue';
    }

    const totalRooms = Math.pow(this.dimensions, 2);
    if (totalRooms - filledRooms.size < totalRooms / 2.5) {
      return this.generateMaze();
    }

    for (var path of paths) {
      for (var i = 0; i < path.length; i++) {
        for (var j = 0; j < this.maze.rooms[i].sides.length; j++) {
          if (path[i].sides[j] instanceof Door && !(this.maze.rooms[i].sides[j] instanceof Door)) {
            this.maze.rooms[i].sides[j] = path[i].sides[j];
          }
        }
        this.maze.rooms[i] = path[i];
      }
    }
    console.log("Finished creating the maze path");
  }

  build3DMaze(): void {
    const roomWidth = 2880;
    const roomDepth = 2880;
    for (let room of this.maze.rooms) {
      const position = new THREE.Vector3(room.id[0] * 2880, room.id[1] * 2880);
      room.Build(position, roomWidth, roomWidth * 0.7, roomDepth);
    }
  }
}
