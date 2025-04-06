export enum Actions {
    Jump = 1,
    Run = 2,
    Sit = 3
};

export interface IAction {
    name: Actions;
    active: boolean;
    start: Date|null;
}

export class Action {
    name: Actions = Actions.Jump;
    start: boolean = false;
}

export enum Touches {
    Land = 1,
    Side = 2,
    Top = 3
};

export class Touch {
    name: Touches;
    constructor(name: Touches) {
        this.name = name;
    }
}