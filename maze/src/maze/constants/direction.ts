export type DirectionType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // Define a union type for direction values

export const Direction = {
    North: 0 as DirectionType,
    South: 1 as DirectionType,
    East: 2 as DirectionType,
    West: 3 as DirectionType,
    NorthEast: 4 as DirectionType,
    SouthEast: 5 as DirectionType,
    SouthWest: 6 as DirectionType,
    NorthWest: 7 as DirectionType
};

export const OppositeDirection = (dir: DirectionType): DirectionType => { // Specify the parameter and return types
    switch (dir) {
        case 0: return 1; // North -> South
        case 1: return 0; // South -> North
        case 2: return 3; // East -> West
        case 3: return 2; // West -> East
        case 4: return 6; // NorthEast -> SouthWest
        case 5: return 7; // SouthEast -> NorthWest
        case 6: return 4; // SouthWest -> NorthEast
        case 7: return 5; // NorthWest -> SouthEast
        default: return 0; // Handle invalid direction
    }
}