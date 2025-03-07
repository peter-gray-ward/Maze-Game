import * as THREE from 'three';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';
import { fromEvent, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

export class User extends MapSite {
    model!: GLTFModel;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    speed: number = 20;
    rotationSpeed: number = Math.PI / 11;
    animationMixer!: THREE.AnimationMixer;
    animations: any = {
        walk: null,
        lounge: null,
        jump: null,
        strafe: null,
        run: null
    };
    actions: any = {
        w: false, a: false, s: false, d: false,
        arrowleft: false, arrowup: false, arrowdown: false, arrowright: false
    };
    localYAxis = new THREE.Vector3(0, 1, 0);
    cameraRadius: number = 144;
    cameraTheta: number = 0.88;
    loaded = new Subject<User>();
    activity = new Subject<User>();
    environment: MapSite[] = [];

    constructor(
        game: Game,
        id: number[],
        position: THREE.Vector3,
        width: number,
        height: number,
        depth: number,
        color: string = "peach",
        text: string = ""
    ) {
        super(game, id, position, width, height, depth, color, text);
        new GLTFLoader().load("/Xbot.glb", model => {
            this.model = model;
            this.animationMixer = new THREE.AnimationMixer(this.model.scene);
            this.init(model);
        });
    }

    private init(model: GLTFModel) {
        this.model = model;
        this.camera.near = 0.1; 
        this.camera.far = 1000000;
        this.camera.updateProjectionMatrix();
        this.model.scene.children[0].scale.set(0.4, 0.4, 0.4);
        this.model.scene.rotateY(Math.PI);
        this.box = new THREE.Box3().setFromObject(this.model.scene);
        this.model.scene.position.set(0, -1100, 0);
        this.addEvents();
        this.startAnimation('lounge')
        this.loaded.next(this);
    }

    override GetRandomTexture(): string {
        return "peach";
    }


    private move(v: THREE.Vector3): void {
        this.camera.position.add(v);
        this.model.scene.position.add(v);
        this.alignCamera();
    }

    private alignCamera(): void {
    const forwardDirection = this.model.scene.getWorldDirection(new THREE.Vector3());
    const headBone = this.model.scene.getObjectByName("Beta_Joints");

    if (headBone) {
        const headPosition = headBone.getWorldPosition(new THREE.Vector3());
        const cameraPhi = 0;

        const cameraRadius = this.cameraRadius * this.cameraTheta;
        const x = cameraRadius * Math.sin(this.cameraTheta) * Math.sin(cameraPhi); // Horizontal plane (x-axis)
        const z = cameraRadius * Math.sin(this.cameraTheta) * Math.cos(cameraPhi); // Horizontal plane (z-axis)
        const y = cameraRadius * Math.cos(this.cameraTheta);

        let point = new THREE.Vector3(x, y, z);

        const defaultDirection = new THREE.Vector3(0, 0, -1);
        const alignmentQuaternion = new THREE.Quaternion();
        alignmentQuaternion.setFromUnitVectors(defaultDirection, forwardDirection.clone().normalize());
        point.applyQuaternion(alignmentQuaternion);

        point.add(headPosition);

        this.camera.position.copy(point);


        this.camera.lookAt(this.model.scene.position
            .clone()
            .add(forwardDirection.multiplyScalar(1000)));
    }
}



    private rotate(dir: number): void {
        this.model.scene.rotateY(dir * 0.3);
    }


    private addEvents(): void {
        fromEvent(window, 'keydown').subscribe((event: any) => {
            let key = event.key.toLowerCase();

            let y = 0;
            this.actions[key] = true;
            let v = new THREE.Vector3();
            v.y = y;
            this.camera.getWorldDirection(v);
            v.normalize();
            let strafeDirection = new THREE.Vector3();
            strafeDirection.crossVectors(this.camera.up, v).normalize();

            switch (key) {
                case 'w':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 's':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'a':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'd':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'arrowleft':
                    this.rotate(1);
                    break;
                case 'arrowright':
                    this.rotate(-1);
                    break;
            }
        });

        fromEvent(window, 'keyup').subscribe((event: any) => {
            let key = event.key.toLowerCase();
            this.actions[key] = false;
            switch (key) {
                case 'w':
                    if (!this.actions.s && !this.actions.a && !this.actions.d) {
                        this.animations.walk.speedFactor = 0;
                        this.startAnimation('lounge');
                    }
                    break;
                case 's':
                    if (!this.actions.a && !this.actions.w && !this.actions.d) {
                        this.animations.walk.speedFactor = 0;
                        this.startAnimation('lounge');
                    }
                    break;
                case 'a':
                    if (!this.actions.s && !this.actions.w && !this.actions.d) {
                        this.animations.walk.speedFactor = 0;
                        this.startAnimation('lounge');
                    }
                    break;
                case 'd':
                    if (!this.actions.s && !this.actions.a && !this.actions.w) {
                        this.animations.walk.speedFactor = 0;
                        this.startAnimation('lounge');
                    }
                    break;
                case 'arrowleft':
                    this.rotate(1);
                    break;
                case 'arrowright':
                    this.rotate(-1);
                    break;  
            }
        });
    }


    startAnimation(which: string): void {
        if (!this.animations[which]) {
            let animationIndex = 0;

            switch (which) {
                case 'run':
                    animationIndex = 3;
                    break;
                case 'walk':
                    animationIndex = 6;
                    break;
                case 'strafe':
                    animationIndex = 6; 
                    break;
                case 'lounge':
                    animationIndex = 1;
                    break;
                case 'jump':
                    animationIndex = 5;
                    break;
                default:
                    break;
            }

            const action = this.animationMixer.clipAction(this.model.animations[animationIndex]);
            this.animations[which] = { action, speedFactor: undefined };
        }
        let speedFactor = 1;
        switch (which) {
            case 'run':
                speedFactor = 5;
                break;
            case 'walk':
                speedFactor = 2.5;
                break;
            case 'strafe':
                speedFactor = 2.5; 
                break;
            case 'lounge':
                speedFactor = 0.001;
                break;
            case 'jump':
                speedFactor = 1;
                break;
            default:
                break;
        }
        this.animations[which].speedFactor = speedFactor;  
    }

    stopAnimation(which: string): void {
        if (this.animations[which]) {
            this.animations[which].speedFactor = 0;
            this.animations[which].action.stop();
        }
    }

    setEnvironment(activeMapSites: MapSite[]): void {
        this.environment = activeMapSites;
    }

    override Act(): void {
        super.Act();
        let y = 0;
        let v = new THREE.Vector3();
        this.camera.getWorldDirection(v);
        v.y = y;
        v.normalize();

        let strafeDirection = new THREE.Vector3();
        strafeDirection.crossVectors(this.camera.up, v).normalize();

        for (let action in this.actions) {
            if (this.actions[action]) {
                switch (action) {
                    case 'w':
                        this.move(v.multiplyScalar(this.speed));
                        break;
                    case 's':
                        this.move(v.multiplyScalar(-this.speed));
                        break;
                    case 'a':
                        this.move(strafeDirection.clone().multiplyScalar(this.speed));
                        break;
                    case 'd':
                        this.move(strafeDirection.clone().multiplyScalar(-this.speed));
                        break;
                    case 'arrowleft':
                        this.rotate(this.rotationSpeed);
                        break;
                    case 'arrowright':
                        this.rotate(-this.rotationSpeed);
                        break;
                    case 'arrowdown':
                        this.cameraTheta -= 0.01;
                        break;
                    case 'arrowup':
                        this.cameraTheta += 0.01;
                }
            }
        }

        for (let which in this.animations) {
            if (this.animations[which]) {
                const action = this.animations[which].action;
                if (this.animations[which].speedFactor) {
                    if (!action.isRunning()) {
                        action.play();
                    }
                    action.setEffectiveTimeScale(this.animations[which].speedFactor);
                } else {
                    action.stop();
                }
            }
        }

        this.animationMixer.update(0.016); // Update animation mixer every frame (~60 FPS)
        this.EngageEnvironment(this.environment);
        this.alignCamera();
        this.activity.next(this);
    }

    EngageEnvironment(environment: MapSite[]): void {
        const fallVector: THREE.Vector3 = this.Fall();
        const userBox = new THREE.Box3().setFromObject(this.model.scene);
        
        const EngageMeshes = (item: THREE.Group | THREE.Mesh) => {
            if (item instanceof THREE.Group) {
                for (let child of item.children) {
                    EngageMeshes(child as (THREE.Group | THREE.Mesh));
                }
            } else {
                const meshBox = new THREE.Box3().setFromObject(item);
                if (userBox.intersectsBox(meshBox)) {
                    this.Touch(userBox, item, meshBox);
                }
            }
        }

        for (let mapSite of environment) {
            EngageMeshes(mapSite.scene);
        }
        
        this.model.scene.position.add(fallVector);
    }

    Fall(): THREE.Vector3 {
        return this.localYAxis.clone().multiplyScalar(this.velocity.y);
    }

    Touch(userBox: THREE.Box3, mesh: THREE.Mesh, meshBox: THREE.Box3): void {

        // Touching from Directly Above
        const userBottomY = userBox.min.y;
        const objectTopY = meshBox.max.y;

        const threshold = 1;
        const overheadDiff = Math.abs(userBottomY - objectTopY);

        if (overheadDiff < threshold && this.velocity.y < 0) {
            console.log("Landed on top at diff", overheadDiff);
            this.velocity.y = 0;
            this.model.scene.position.y = objectTopY + mesh.geometry.boundingBox!.max.y -  mesh.geometry.boundingBox!.min.y;
        }

    }

}
