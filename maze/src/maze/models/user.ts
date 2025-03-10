import * as THREE from 'three';
import { Game } from '../singletons/game';
import { MapSite } from './map-site';
import { fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { inject, Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getAllDescendants } from '../utils/object';
import { BookShelf } from './book-shelf';
import { Book, IBook } from './book';

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
};

export class User extends MapSite {
    model!: GLTFModel;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    speed: number = 3;
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
    cameraTheta: number = 1;
    loaded = new Subject<User>();
    activity = new Subject<User>();
    environment: MapSite[] = [];
    previousPosition: THREE.Vector3 = new THREE.Vector3(0,0,0);
    currentRoomId: number[] = [];
    targetSubject = new BehaviorSubject<Target|null>(null);
    target$ = this.targetSubject.asObservable();
    engagementSubject = new BehaviorSubject<Target|null>(null);
    public engagement$ = this.engagementSubject.asObservable();
    private sanitizer = inject(DomSanitizer);

    constructor(
        game: Game,
        id: number[],
        position: THREE.Vector3,
        rotation: THREE.Vector3,
        width: number,
        height: number,
        depth: number,
        color: string = "peach",
        text: string = ""
    ) {
        super(game, id, position, rotation, width, height, depth, color, text);
        new GLTFLoader().load("/Xbot.glb", model => {
            this.model = model;
            this.model.scene.castShadow = true;
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
        this.model.scene.position.set(0, 0, 0);
        this.addEvents();
        this.startAnimation('lounge')
        this.loaded.next(this);
    }

    override GetRandomTexture(): string {
        return "peach";
    }


    private move(): void {
        this.previousPosition.copy(this.model.scene.position.clone());
        this.camera.position.add(this.velocity);
        this.model.scene.position.add(this.velocity);
        this.alignCamera();
    }

    private alignCamera(): void {
        const headBone = this.model.scene.getObjectByName("Beta_Joints");
        if (headBone) {
            const headPosition = headBone.getWorldPosition(new THREE.Vector3());
            const forwardDir = this.model.scene.getWorldDirection(new THREE.Vector3());
            const backwardDir = forwardDir.clone().negate();
            const cameraRadius = this.cameraRadius * Math.pow(this.cameraTheta, 8);
            const verticalOffset = this.localYAxis.clone().multiplyScalar(Math.sin(this.cameraTheta) * cameraRadius);
            const backwardOffset = backwardDir.clone().multiplyScalar(Math.cos(this.cameraTheta) * cameraRadius);
            const cameraPosition = headPosition.clone()
                .add(verticalOffset)  // Move up/down
                .add(backwardOffset); // Move closer/further behind
            this.camera.position.copy(cameraPosition);

            const lookPosition = headPosition.add(new THREE.Vector3(0, 80, 0))//.add(forwardDir.multiplyScalar(3000 * (1 / this.cameraTheta)))
            this.camera.lookAt(lookPosition);
        }
    }



    private rotate(dir: number): void {
        this.model.scene.rotateY(dir * 0.3);
    }


    private addEvents(): void {
        fromEvent(window, 'keydown').subscribe((event: any) => {
            let key = event.key.toLowerCase();

            let y = 0;
            
            let forwardVector = new THREE.Vector3();
            this.camera.getWorldDirection(forwardVector);
            forwardVector.y = y;
            forwardVector.normalize();
            let strafeDirection = new THREE.Vector3();
            strafeDirection.crossVectors(this.camera.up, forwardVector).normalize();

            let velocityAddition = new THREE.Vector3();

            switch (key) {
                case 'w':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    if (!this.actions[key]) velocityAddition.add(forwardVector.clone().multiplyScalar(this.speed));
                    break;
                case 's':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    if (!this.actions[key]) velocityAddition.add(forwardVector.clone().multiplyScalar(-this.speed));
                    break;
                case 'a':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    if (!this.actions[key]) velocityAddition.add(strafeDirection.clone().multiplyScalar(this.speed));
                    break;
                case 'd':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    if (!this.actions[key]) velocityAddition.add(strafeDirection.clone().multiplyScalar(-this.speed));
                    break;
                case 'arrowleft':
                    this.rotate(1);
                    break;
                case 'arrowright':
                    this.rotate(-1);
                    break;
            }

            this.actions[key] = true;

            this.velocity.add(velocityAddition);
        });

        fromEvent(window, 'keyup').subscribe((event: any) => {
            let key = event.key.toLowerCase();
            this.actions[key] = false; // Mark key as released

            // Recalculate velocity based on remaining active keys
            let newVelocity = new THREE.Vector3();
            let forwardVector = new THREE.Vector3();
            this.camera.getWorldDirection(forwardVector);
            forwardVector.y = 0;
            forwardVector.normalize();
            let strafeDirection = new THREE.Vector3();
            strafeDirection.crossVectors(this.camera.up, forwardVector).normalize();

            if (this.actions.w) newVelocity.add(forwardVector.clone().multiplyScalar(this.speed));
            if (this.actions.s) newVelocity.add(forwardVector.clone().multiplyScalar(-this.speed));
            if (this.actions.a) newVelocity.add(strafeDirection.clone().multiplyScalar(this.speed));
            if (this.actions.d) newVelocity.add(strafeDirection.clone().multiplyScalar(-this.speed));

            // Update velocity based on remaining active keys
            this.velocity.copy(newVelocity);

            // Stop animation if no movement keys are held
            if (this.animations.walk && !this.actions.w && !this.actions.s && !this.actions.a && !this.actions.d) {
                this.animations.walk.speedFactor = 0;
                this.startAnimation('lounge');
            }
        });

        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        fromEvent(window, 'mousemove').subscribe((event: any) => {
            if (this.engagementSubject.value) return;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const currentRoom = this.game.maze.rooms.find(room => room.id.join(',') == this.currentRoomId.join(','));

            if (currentRoom) {
                currentRoom.scene.updateWorldMatrix(true, true);
                let allRoomChildren = getAllDescendants(currentRoom.scene).filter(c => /mouseable/.test(c.name))

                allRoomChildren.forEach((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.updateWorldMatrix(true, true);
                        child.geometry.computeBoundingBox();
                        child.geometry.computeBoundingSphere();
                    }
                });


                const intersects = raycaster.intersectObjects(allRoomChildren);
                let foundItem = false;

                if (intersects.length > 0) {
                    let mesh = intersects[0].object;
                    
                    for (let item of currentRoom.items) {


                        if (item instanceof BookShelf) {
                            let target: Target|null = null;
                            for (let book of item.books) {
                                if (book.scene.uuid == mesh.uuid && !book.hovered) {
                                    item.Mouseover(mesh as THREE.Mesh);
                                    const iFrameSrc = ((book as Book).book as IBook).formats['text/html'];
                                    target = { 
                                        mesh: mesh as THREE.Mesh, 
                                        mapSite: book as MapSite,
                                        data: (book as Book).book,
                                        message: `${(book as Book).book.title} (${(book as Book).book.topic})`,
                                        content: this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${iFrameSrc}" width="90%" height="90%" style="background:white"></iframe>`)
                                    } as Target;
                                } else if (book.hovered) {
                                    item.Mouseleave();
                                }
                            }
                            if ((!this.targetSubject.value && target)
                                || (this.targetSubject.value && !target)
                                || (target && this.targetSubject.value && target.mesh.uuid !== this.targetSubject.value.mesh.uuid)) {
                                foundItem = true;
                                this.targetSubject.next(target);
                            }
                        }



                    }

                    
                }

                if (!foundItem) {
                    this.targetSubject.next(null);
                }
            }
        });

        fromEvent(window, 'mousedown').subscribe((event: any) => {
            if (!this.engagementSubject.value && this.targetSubject.value) {
                const val = this.targetSubject.value;
                this.targetSubject.next(null);
                if (val.mapSite.isItem) this.engagementSubject.next(val);
            }
        });

        fromEvent(window, 'mouseup').subscribe((event: any) => {
            this.targetSubject.next(null);
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
        
        let forwardVector = new THREE.Vector3();
        this.camera.getWorldDirection(forwardVector);
        forwardVector.y = 0;
        forwardVector.normalize();

        for (let action in this.actions) {
            if (this.actions[action]) {
                switch (action) {
                    case 'arrowleft':
                        this.rotate(this.rotationSpeed);
                        break;
                    case 'arrowright':
                        this.rotate(-this.rotationSpeed);
                        break;
                    case 'arrowdown':
                        this.cameraTheta += 0.005;
                        break;
                    case 'arrowup':
                        this.cameraTheta -= 0.005;
                        break;
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
        this.move();
        this.EngageEnvironment(this.environment, forwardVector);
        this.alignCamera();
        this.activity.next(this);
    }



    EngageEnvironment(environment: MapSite[], forwardVector: THREE.Vector3): void {
        const fallVector: THREE.Vector3 = this.Fall();
        const userBox = new THREE.Box3().setFromObject(this.model.scene);
        let sidewaysVector = new THREE.Vector3();
        sidewaysVector.crossVectors(this.camera.up, forwardVector).normalize();
        
        const EngageMeshes = (mapSite: MapSite, item: (THREE.Group | THREE.Mesh)) => {
            if (item instanceof THREE.Group) {
                for (let child of item.children) {
                    EngageMeshes(mapSite, child as (THREE.Group | THREE.Mesh));
                }
            } else  {
                const meshBox = new THREE.Box3().setFromObject(item);
                if (userBox.intersectsBox(meshBox)) {
                    this.currentRoomId = mapSite.id;
                    this.targetSubject.next({ 
                        mesh: item as THREE.Mesh, 
                        mapSite: mapSite,
                        data: {},
                        message: `${mapSite.text}: ${item.name}`,
                        content: ''
                    } as Target)
                    this.Touch(mapSite, userBox, item, meshBox, forwardVector);
                }
            }
        }

        for (let mapSite of environment) {
            EngageMeshes(mapSite, mapSite.scene);
        }
        
        this.model.scene.position.add(fallVector);
        this.activity.next(this);
    }

    Fall(): THREE.Vector3 {
        return this.localYAxis.clone().multiplyScalar(this.velocity.y);
    }

    Touch(
        mapSite: MapSite,
        userBox: THREE.Box3,
        mesh: THREE.Mesh,
        meshBox: THREE.Box3,
        forwardVector: THREE.Vector3
    ): void {
        if (/no\-collision/.test(mesh.name)) return

        mapSite.Mouseover(mesh, true);

        const userBottomY = userBox.min.y;
        const objectTopY = meshBox.max.y;
        const threshold = 1;
        const overheadDiff = Math.abs(userBottomY - objectTopY);

        // Handle landing on top
        if ((overheadDiff < threshold || (userBottomY < objectTopY && threshold < 10)) && this.velocity.y < 0) {
            console.log("Landed on top at diff", overheadDiff);
            this.velocity.y = 0;
            this.model.scene.position.y = objectTopY + (mesh.geometry.boundingBox!.max.y - mesh.geometry.boundingBox!.min.y);
            return;
        }

        // Use previous position to determine rollback direction
        let rollbackVector = this.model.scene.position.clone().sub(this.previousPosition).normalize();

        // Compute penetration depths
        const penetrationX1 = userBox.max.x - meshBox.min.x;
        const penetrationX2 = meshBox.max.x - userBox.min.x;
        const penetrationZ1 = userBox.max.z - meshBox.min.z;
        const penetrationZ2 = meshBox.max.z - userBox.min.z;

        const penetrationDepthX = Math.min(penetrationX1, penetrationX2);
        const penetrationDepthZ = Math.min(penetrationZ1, penetrationZ2);

        let correctionVector = new THREE.Vector3();

        // Handle corner collisions by resolving both X and Z if needed
        if (penetrationDepthX < penetrationDepthZ * 1.1 && penetrationDepthZ < penetrationDepthX * 1.1) {
            // Both penetration depths are small → corner case → move out diagonally
            let normalX = penetrationX1 < penetrationX2 ? -1 : 1;
            let normalZ = penetrationZ1 < penetrationZ2 ? -1 : 1;
            correctionVector.set(
                normalX * penetrationDepthX * 1.01,
                0,
                normalZ * penetrationDepthZ * 1.01
            );
        } else if (penetrationDepthX < penetrationDepthZ) {
            // Resolve X penetration
            let normalX = penetrationX1 < penetrationX2 ? -1 : 1;
            correctionVector.set(normalX * penetrationDepthX * 1.01, 0, 0);
        } else {
            // Resolve Z penetration
            let normalZ = penetrationZ1 < penetrationZ2 ? -1 : 1;
            correctionVector.set(0, 0, normalZ * penetrationDepthZ * 1.01);
        }

        // Apply the correction to move the player outside the wall/corner
        this.model.scene.position.add(correctionVector);
    }



}
