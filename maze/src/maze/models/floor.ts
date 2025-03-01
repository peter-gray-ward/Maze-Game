import { MapSite } from './map-site';

export class Floor extends MapSite {
    override GetRandomTexture(): string {
    	return "green";
    }
}