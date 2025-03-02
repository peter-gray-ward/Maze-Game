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

export class User extends MapSite {
    model!: GLTFModel;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    speed: number = 12;
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
    cameraOffset: number = -300;
    loaded = new Subject<User>();
    activity = new Subject<User>();

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
        this.model.scene.position.set(0, -95, 0);

        const headBone = this.model.scene.getObjectByName("Beta_Joints");
        if (headBone) {
            headBone.add(this.camera);
            this.camera.position.set(0, 500, this.cameraOffset); 
            this.camera.rotation.set(0, Math.PI, 0);
        } else {
            console.warn("Head bone not found in GLTF model!");
        }

        this.addEvents();
        this.loaded.next(this);
    }

    override GetRandomTexture(): string {
        return "peach";
    }


    private move(v: THREE.Vector3): void {
        this.camera.position.add(v);
        this.model.scene.position.add(v);

        const headBone = this.model.scene.getObjectByName("Beta_Joints");
        if (headBone) {
            headBone.add(this.camera);
            this.camera.position.set(0, 500, this.cameraOffset);
        }
    }

    private rotate(angle: number): void {
        this.model.scene.rotateY(angle);
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
                    this.move(v.multiplyScalar(this.speed));
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 's':
                    this.move(v.multiplyScalar(-this.speed));
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'a':
                    this.move(strafeDirection.multiplyScalar(this.speed));
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'd':
                    this.move(strafeDirection.multiplyScalar(-this.speed));
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    break;
                case 'arrowleft':
                    this.rotate(Math.PI / 11);
                    break;
                case 'arrowright':
                    this.rotate(-Math.PI / 11);
                    break;  
            }
        });

        fromEvent(window, 'keyup').subscribe((event: any) => {
            let key = event.key.toLowerCase();
            this.actions[key] = false;
            if (['w', 's', 'a', 'd'].includes(key)) {
                if (this.animations.walk) {
                    this.animations.walk.action.stop();
                    this.animations.walk.speedFactor = 0;
                    this.startAnimation('lounge');
                }
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
                speedFactor = 1;
                break;
            case 'strafe':
                speedFactor = 1; 
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
                        this.move(strafeDirection.multiplyScalar(this.speed));
                        break;
                    case 'd':
                        this.move(strafeDirection.multiplyScalar(-this.speed));
                        break;
                    case 'arrowleft':
                        this.rotate(Math.PI / 11);
                        break;
                    case 'arrowright':
                        this.rotate(-Math.PI / 11);
                        break;
                }
            }
        }
        for (let which in this.animations) {
            if (this.animations[which] && this.animations[which].speedFactor) {
                const action = this.animations[which].action;
                if (!action.isRunning()) {
                    action.play();
                }
                action.setEffectiveTimeScale(this.animations[which].speedFactor);
            }
        }
        this.animationMixer.update(0.016); // Update animation mixer every frame (~60 FPS)
        this.activity.next(this);
    }

}
