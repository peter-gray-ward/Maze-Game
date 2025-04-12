import * as THREE from 'three';
import { MapSite } from '../models/map-site';

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

export interface GLTFModel {
    animations: any[];
    asset: any;
    cameras: any[];
    parser: any;
    scene: THREE.Group;
    scenes: THREE.Group[];
    userData: any;
}

export interface UserPosition {
    x: number;
    y: number;
    z: number;
    left: number;
    top: number;
}

export interface Target {
    mesh: THREE.Mesh;
    mapSite: MapSite;
    message: string;
    data: any;
    content: string;
    background: string;
};
