import { MapSite } from './map-site';
import { Room } from './room';
import { Game } from '../singletons/game';
import * as THREE from 'three';
import { DirectionType } from '../constants/direction';

export class Side extends MapSite {
    public direction!: DirectionType;
    public rooms: Room[] = [];
    
    public getActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    constructor(game: Game, id: number[], position: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string) {
        super(game, id, position, width, height, depth, color, text);
    }

    GetRandomTexture(): string {
        return "green";
    }
}