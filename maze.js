const Direction = {
    North: 0,
    South: 1,
    East: 2,
    West: 3,
    NorthEast: 4,
    SouthEast: 5,
    SouthWest: 6,
    NorthWest: 7,
    opposite: dir => {
        if (dir == 0) return 1;
        if (dir == 1) return 0;
        if (dir == 2) return 3;
        if (dir == 3) return 2;
        if (dir == 4) return 6;
        if (dir == 5) return 7;
        if (dir == 6) return 4;
        if (dir == 7) return 5;
    }
};

function keyOf(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value) || '';
}


class MapSite {
    color = "transparent";
    text = "";
}

class Side extends MapSite {
    direction;

    constructor(direction) {
        super();
        this.direction = direction;
    }
}

class Wall extends Side {
    constructor(direction) {
        super(direction);
    }
}

class Door extends Side {
    roomA;
    roomB;
    otherSide = null;  // Add reference to matching door
    open = false;

    constructor(direction, roomA, roomB, color) {
        super(direction);
        this.roomA = roomA;
        this.roomB = roomB;
        this.color = color;
    }
}

class Room extends MapSite {
    sides = Array.from({ length: 4 }).fill(null);

    constructor(id) {
        super(id);
    }

    SetSide(dir, side) {
        this.sides[dir] = side;
    }

    GetSide(dir) {
        return this.sides[dir];
    }
}

class Maze {
    rooms = [];

    constructor(dimensions) {
        // Create rooms in column-major order to match x,y coordinates
        for (var x = 0; x < dimensions; x++) {
            for (var y = 0; y < dimensions; y++) {
                this.AddRoom(
                    new Room([x, y])
                );
            }
        }
    }

    AddRoom(room) {
        this.rooms.push(room);
    }

    RoomNumber(id) {
        return this.rooms.find(room => room.id.join(',') == id.join(','));
    }
}

class MazeGame {
    dimensions;
    maze;
    doorConnections = new Set();
    
    constructor(dimensions = 12) {
        this.dimensions = dimensions;
        this.maze = new Maze(dimensions);
    }

    CreateMaze() {
        var currentRoom = 0;
        var paths = [];
        const directionStrategy = Object.keys(Direction).filter(key => typeof Direction[key] == 'number').map(key => Direction[key]); // Trending strategy
        let currentDirectionIndex = 0;

        for (var i = 0; i < 1; i++) {
            var path = this.maze.rooms;
            var x = 0;
            while (currentRoom !== Math.pow(this.dimensions, 2) - 1) {
                let roomA = path[currentRoom];
                let nextRoom;
                let direction = Math.random() < 0.3 ? directionStrategy[currentDirectionIndex] : directionStrategy[Math.floor(Math.random() * directionStrategy.length)]; // Get the current direction from the strategy

                if (Math.random() < 0.015) {
                    direction = Direction.opposite(direction);
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
                        new Door(direction, roomA, roomB, adjoiningColor)
                    );

                    path[nextRoom].SetSide(
                        Direction.opposite(direction),
                        new Door(Direction.opposite(direction), roomB, roomA, adjoiningColor)
                    );

                    currentRoom = nextRoom;
                    paths.push(path);
                }
            }

            path[currentRoom].color = 'aliceblue';
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
}


require('http').createServer((req, res) => {
    let dimensions = 15;
    let game = new MazeGame(dimensions);
    game.CreateMaze();

    console.log("created the maze")
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<head>
<meta charset="UTF-8">
<title>Maze</title>
<style>
html, body {
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    padding: 0;
    margin: 0;

    --wall-width: 0.15rem;
}
body {
    border-left: 1px solid;
    border-bottom: 1px solid;
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    transform-style: preserve-3d;
}
.room {
    width: calc(100vw / ${dimensions} - 1px);
    height: calc(100vh / ${dimensions} - 1px);
    margin: 0;
    box-sizing: border-box;
    border-top: 1px solid;
    border-right: 1px solid;
    padding: 0;
    position: relative;
}
.side {
    position: absolute;
}
.side.North {
    top: 0;
    left: 0;
    width: 100%;
    height: var(--wall-width);
}
.side.South {
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--wall-width);
}
.side.East {
    top: 0;
    right: 0;
    width: var(--wall-width);
    height: 100%;
}
.side.West {
    top: 0;
    left: 0;

    
    width: var(--wall-width);
    height: 100%;
}
.side.wall {
    background: blue;
}
.side.door {
    background: red;
}
</style>
</head>
<body>
    ${
        game.maze.rooms.map(room => {
            return `<div class="room" id="${room.id.join(",")}" style="background:${room.color}">
                ${
                    Object.values(Direction).map(dir => {
                        let side = room.GetSide(dir);
                        if (side instanceof Wall) {
                            return `<div class="side ${keyOf(Direction, dir)} wall" style="background:${side.color}"></div>`;
                        } else if (side instanceof Door) {
                            return `<div class="side ${keyOf(Direction, dir)} door" style="background:${side.color}"></div>`;
                        }
                        return '';
                    }).join('')
                }
            </div>`;
        }).join('')
    }
</body>
    </html>`);
}).listen(3000, () => console.log("Server running on port 3000"));

