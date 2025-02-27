const Direction = {
    North: 0,
    South: 1,
    East: 2,
    West: 3,
    opposite: dir => {
        if (dir == 0) return 1;
        if (dir == 1) return 0;
        if (dir == 2) return 3;
        if (dir == 3) return 2;
    }
};

function keyOf(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value) || '';
}


class MapSite {
    Enter() {}
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

    constructor(direction, roomA, roomB) {
        super(direction);
        this.roomA = roomA;
        this.roomB = roomB;
    }
}

class Room extends MapSite {
    roomNumber;
    sides = Array.from({ length: 4 }).fill(null);

    constructor(roomNumber) {
        super();
        this.roomNumber = roomNumber;
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

    RoomNumber(roomNumber) {
        return this.rooms.find(room => room.roomNumber.join(',') == roomNumber.join(','));
    }
}

class MazeGame {
    maze;
    doorConnections = new Set();
    
    constructor(dimensions = 12) {
        this.maze = new Maze(dimensions);
    }

    CreateMaze() {
        var currentRoom = 0; // Start from the first room
        var direction = Direction.East; // Start by moving East

        while (currentRoom !== 144) { // Continue until reaching the last room
            let roomA = this.maze.rooms[currentRoom];
            let nextRoom;

            // Determine the next room based on the current direction
            if (direction === Direction.East) {
                nextRoom = currentRoom + 1; // Move East
            } else {
                nextRoom = currentRoom + 12; // Move South
            }

            // Ensure nextRoom is valid
            if (nextRoom < this.maze.rooms.length) {
                let roomB = this.maze.rooms[nextRoom];

                // Create a door between the current room and the next room
                this.maze.rooms[currentRoom].SetSide(
                    direction,
                    new Door(direction, roomA, roomB)
                );

                this.maze.rooms[nextRoom].SetSide(
                    Direction.opposite(direction),
                    new Door(Direction.opposite(direction), roomB, roomA)
                );

                // Update currentRoom to the next room
                currentRoom = nextRoom;

                // Alternate direction
                direction = direction === Direction.East ? Direction.South : Direction.East;
            } else {
                break; // Exit if nextRoom is invalid
            }
        }
        console.log("Finished creating the maze path");
    }
}


// Run the game
let game = new MazeGame(12);
game.CreateMaze();

console.log("created the maze", game.maze.rooms)

require('http').createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<head>
<meta charset="UTF-8">
<title>Maze</title>
<style>
html, body {
    width: 100vwh;
    height: 100vh;
    box-sizing: border-box;
    padding: 0;
    margin: 0;

    --wall-width: 0.5rem;
}
body {
    border-left: 1px solid;
    border-bottom: 1px solid;
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
}
.room {
    width: calc(100vw / 12 - 1px);
    height: calc(100vh / 12 - 1px);
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
            return `<div class="room" id="${room.roomNumber.join(",")}">
                ${
                    Object.values(Direction).map(dir => {
                        let side = room.GetSide(dir);
                        if (side instanceof Wall) {
                            return `<div class="side ${keyOf(Direction, dir)} wall"></div>`;
                        } else if (side instanceof Door) {
                            return `<div class="side ${keyOf(Direction, dir)} door"></div>`;
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

