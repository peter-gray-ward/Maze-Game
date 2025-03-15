import { MapSite } from "./map-site";
import * as THREE from 'three';
import { Game } from '../singletons/game';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';



export abstract class Light extends MapSite {
    public light!: THREE.Light;
}

export class CeilingLight extends Light {
    constructor(game: Game, id: number[], position: THREE.Vector3, rotation: THREE.Vector3, width: number, height: number, depth: number, color: string, text: string, light: THREE.Light) {
        super(game, id, position, rotation, width, height, depth, color, text);
        this.light = light;
    }

    override Build() {
        super.Build();

        this.light = new THREE.PointLight(0xffffff, 10000, 1000);
        this.light.position.copy(this.position)
        this.light.castShadow = true;
        (this.light.shadow as THREE.PointLightShadow).mapSize.width = 512; 
        (this.light.shadow as THREE.PointLightShadow).mapSize.height = 512;
        (this.light.shadow as THREE.PointLightShadow).bias = -0.0005;
        (this.light.shadow as THREE.PointLightShadow).camera.near = 1;   // Don't start shadows too close
        (this.light.shadow as THREE.PointLightShadow).camera.far = 400;  // Adjust based on scene size


        this.light.position.copy(this.position.clone().add(new THREE.Vector3(0, -20, 0)));
        this.scene.name = 'light - ' + this.id.join(',');
        this.scene.add(this.light);


        let lightGroup = new THREE.Group();
        let wire = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 20), // Tall and thin wire
            new THREE.MeshStandardMaterial({
                metalness: 1,
                roughness: 0,
                color: new THREE.Color('slategray')
            })
        );
        wire.position.set(0, -10, 0);


        const points = [];
        let scale = 10;
        let halfScale = scale / 2;
        for ( let i = 0; i < 10; i ++ ) {
            points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * scale + halfScale, ( i - halfScale ) * 2 ) );
        }
        const geometry = new THREE.LatheGeometry( points, 30 );
        const material = new THREE.MeshStandardMaterial( { color: 'slategray', side: THREE.DoubleSide } );
        const lathe = new THREE.Mesh( geometry, material );
        lathe.castShadow = true;
        lathe.rotation.x = Math.PI;
        lathe.position.y -= 20

        // Light Bulb
        let lightBulb = new THREE.Mesh(
            new THREE.SphereGeometry(3, 16, 16),
            new THREE.MeshStandardMaterial({
                emissive: new THREE.Color(this.light.color),
                emissiveIntensity: this.light.intensity * 0.5, // Factor in intensity
                color: new THREE.Color('lightyellow')
            })
        );
        lightBulb.position.set(0, -22, 0); 

        lightGroup.add(wire, lathe, lightBulb);
        
        let ceilingPosition = this.position.clone().add(new THREE.Vector3(0, 20, 0));
        lightGroup.position.copy(ceilingPosition);

        this.scene.add(lightGroup);
    }



    override GetRandomTexture(): string {
        return "green";
    }

    static LightBuilder = class extends MapSite.MapSiteBuilder {
        public _light!: THREE.Light;

        light(light: THREE.Light): this {
            this._light = light;
            return this;
        }

        build(): CeilingLight {
            return new CeilingLight(this._game, this._id, this._position, this._rotation, this._width, this._height, this._depth, this._color, this._text, this._light);
        }
    }

    override Act(): void {
        super.Act();

        console.log("Inside Light.Act");
    }
}
