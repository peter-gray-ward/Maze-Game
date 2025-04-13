import * as THREE from 'three';
import { Game } from '../singletons/game';
import { Room } from './room';
import { MapSite } from './map-site';
import { fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { inject, Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getAllDescendants, includes} from '../utils/object';
import { BookShelf } from './book-shelf';
import { Book, IBook } from './book';
import { IAction, Actions, Action, Touches, Touch } from '../constants/user';
import { PixabayResponse, PixabayHit } from '../constants/index';
import { GLTFModel, UserPosition, Target } from '../constants/user'
import Pixabay from '../services/pixabay.service';

export class User extends MapSite {
    model!: GLTFModel;
    firstPerson: boolean = false;
    camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    speed: number = 2;
    JUMP_SPIRIT: number = 1
    rotationSpeed: number = Math.PI / 11;
    animationMixer!: THREE.AnimationMixer;
    animations: any = {
        walk: null,
        lounge: null,
        jump: null,
        strafe: null,
        run: null
    };
    keys: any = {
        w: false, a: false, s: false, d: false,
        arrowleft: false, arrowup: false, arrowdown: false, arrowright: false,
        space: false
    };
    actions: any = {
        [Actions.Jump]: new Action()
    };
    states: any = {
        [Actions.Jump]: false
    }
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
    target: Target|null = null;
    cursorSubject: BehaviorSubject<{[key:string]: number}> = new BehaviorSubject<{[key:string]: number}>({ left: 0, top: 0 });
    engagementSubject = new BehaviorSubject<Target|null>(null);
    public engagement$ = this.engagementSubject.asObservable();
    private sanitizer = inject(DomSanitizer);
    pixabay: Pixabay = inject(Pixabay);
    running: boolean = false;
    walking: boolean = false;

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


    private alignCamera(): void {
        const headBone = this.model.scene.getObjectByName("Beta_Joints");
        if (headBone) {
            const headPosition = headBone.getWorldPosition(new THREE.Vector3());
            const forwardDir = this.model.scene.getWorldDirection(new THREE.Vector3());
            let lookPosition;
            if (!this.firstPerson) {
                const backwardDir = forwardDir.clone().negate();
                const cameraRadius = this.cameraRadius * Math.pow(this.cameraTheta, 8);
                const verticalOffset = this.localYAxis.clone().multiplyScalar(Math.sin(this.cameraTheta) * cameraRadius);
                const backwardOffset = backwardDir.clone().multiplyScalar(Math.cos(this.cameraTheta) * cameraRadius);
                const cameraPosition = headPosition.clone()
                    .add(verticalOffset)  // Move up/down
                    .add(backwardOffset); // Move closer/further behind
                this.camera.position.copy(cameraPosition);

                lookPosition = headPosition.clone().add(new THREE.Vector3(0, 80, 0));
            } else {
                this.camera.position.copy(headPosition.clone().add(new THREE.Vector3(0, 70, 0)));
                const rightDir = new THREE.Vector3().crossVectors(forwardDir, this.localYAxis).normalize();
                const quaternion = new THREE.Quaternion().setFromAxisAngle(rightDir, -this.cameraTheta * 10);
                const rotatedLookDir = forwardDir.clone().applyQuaternion(quaternion).normalize();

                lookPosition = headPosition.clone().add(rotatedLookDir.multiplyScalar(-1000));
            }
            this.camera.lookAt(lookPosition);
        }
    }



    private rotate(dir: number): void {
        this.model.scene.rotateY(dir * 0.3);
    }

    private startJumpInit(start: Date) {
        this.actions[Actions.Jump].start = true;
    }

    private endJumpInit() {
        this.actions[Actions.Jump].start = false;
    }

    private move(key: string = '') {

        let forwardVector = new THREE.Vector3();
        this.camera.getWorldDirection(forwardVector);
        forwardVector.y = 0;
        forwardVector.normalize();
        let strafeDirection = new THREE.Vector3();
        strafeDirection.crossVectors(this.camera.up, forwardVector).normalize();

        let velocityAddition = new THREE.Vector3();
        let speed = this.keys.shift ? this.speed * 5 : this.speed;


        if (['w','a','s','d','arrowleft','arrowup','arrowright','arrowdown'].includes(key)) {
             switch (key) {
                case 'w':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    velocityAddition.add(forwardVector.clone().multiplyScalar(speed));
                    break;
                case 's':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    velocityAddition.add(forwardVector.clone().multiplyScalar(-speed));
                    break;
                case 'a':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    velocityAddition.add(strafeDirection.clone().multiplyScalar(speed));
                    break;
                case 'd':
                    this.startAnimation('walk');
                    this.stopAnimation('lounge');
                    velocityAddition.add(strafeDirection.clone().multiplyScalar(-speed));
                    break;
                case 'arrowleft':
                    this.rotate(1);
                    break;
                case 'arrowright':
                    this.rotate(-1);
                    break;
                case '':
                case 'space':
                case ' ':
                    key = 'space';
                    if (!this.keys[key]) this.startJumpInit(new Date());
                    break;
                case 'shift':
                    if (!this.running) {
                        this.speed *= 3;
                        this.running = true;
                    }
                    break;
            }

            this.velocity.add(velocityAddition);

            if (['w','a','s','d'].includes(key)) {
                this.previousPosition.copy(this.model.scene.position.clone());
                this.camera.position.add(this.velocity);
                this.model.scene.position.add(this.velocity);
                this.alignCamera();
            }
        }

        this.velocity.add(velocityAddition);
    }

    private addEvents(): void {
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        
        fromEvent(window, 'keydown').subscribe((event: any) => {
            let key = event.key.toLowerCase();

            this.keys[key] = true;

            this.move(key);

        });
        fromEvent(window, 'keyup').subscribe((event: any) => {
            let key = event.key.toLowerCase();



            if (key == 'shift') {
                console.log("shift keyup")
                this.running = false;
            }


            this.keys[key] = false; // Mark key as released

            // Recalculate velocity based on remaining active keys
            let newVelocity = new THREE.Vector3();
            let forwardVector = new THREE.Vector3();
            this.camera.getWorldDirection(forwardVector);
            forwardVector.y = 0;
            forwardVector.normalize();
            let strafeDirection = new THREE.Vector3();
            strafeDirection.crossVectors(this.camera.up, forwardVector).normalize();

            if (this.keys.w) newVelocity.add(forwardVector.clone().multiplyScalar(this.speed));
            if (this.keys.s) newVelocity.add(forwardVector.clone().multiplyScalar(-this.speed));
            if (this.keys.a) newVelocity.add(strafeDirection.clone().multiplyScalar(this.speed));
            if (this.keys.d) newVelocity.add(strafeDirection.clone().multiplyScalar(-this.speed));
            if (this.keys.space) setTimeout(() => {
                this.endJumpInit()
                this.keys.space = false;
            }, 300);

            // Update velocity based on remaining active keys
            this.velocity.copy(newVelocity);

            // Stop animation if no movement keys are held
            if (this.animations.walk && !this.keys.w && !this.keys.s && !this.keys.a && !this.keys.d) {
                this.animations.walk.speedFactor = 0;
                this.startAnimation('lounge');
            }
        });
        fromEvent(window, 'mousemove').subscribe((event: any) => {
            if (this.engagementSubject.value) return;

            this.cursorSubject.next({ 
                left: event.clientX, 
                top: event.clientY,
                mouse: 1
            });

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const currentRoom = this.game.maze.rooms.find((room: Room) => room.id.join(',') == this.currentRoomId.join(','));

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


                /*

                HHHHHHHHH     HHHHHHHHH                                                                             
                H:::::::H     H:::::::H                                                                             
                H:::::::H     H:::::::H                                                                             
                HH::::::H     H::::::HH                                                                             
                  H:::::H     H:::::H     ooooooooooo vvvvvvv           vvvvvvv eeeeeeeeeeee    rrrrr   rrrrrrrrr   
                  H:::::H     H:::::H   oo:::::::::::oov:::::v         v:::::vee::::::::::::ee  r::::rrr:::::::::r  
                  H::::::HHHHH::::::H  o:::::::::::::::ov:::::v       v:::::ve::::::eeeee:::::eer:::::::::::::::::r 
                  H:::::::::::::::::H  o:::::ooooo:::::o v:::::v     v:::::ve::::::e     e:::::err::::::rrrrr::::::r
                  H:::::::::::::::::H  o::::o     o::::o  v:::::v   v:::::v e:::::::eeeee::::::e r:::::r     r:::::r
                  H::::::HHHHH::::::H  o::::o     o::::o   v:::::v v:::::v  e:::::::::::::::::e  r:::::r     rrrrrrr
                  H:::::H     H:::::H  o::::o     o::::o    v:::::v:::::v   e::::::eeeeeeeeeee   r:::::r            
                  H:::::H     H:::::H  o::::o     o::::o     v:::::::::v    e:::::::e            r:::::r            
                HH::::::H     H::::::HHo:::::ooooo:::::o      v:::::::v     e::::::::e           r:::::r            
                H:::::::H     H:::::::Ho:::::::::::::::o       v:::::v       e::::::::eeeeeeee   r:::::r            
                H:::::::H     H:::::::H oo:::::::::::oo         v:::v         ee:::::::::::::e   r:::::r            
                HHHHHHHHH     HHHHHHHHH   ooooooooooo            vvv            eeeeeeeeeeeeee   rrrrrrr   

                */


                const intersects = raycaster.intersectObjects(allRoomChildren);
                let target: Target|null = this.target ? this.target : null;
                let targetPromises = [];


                if (intersects.length > 0) {

                    let mesh = intersects[0].object;

                    for (let item of currentRoom.items) {
                        if (item instanceof BookShelf) {
                            for (let book of item.books) {
                                if (book.scene.uuid == mesh.uuid && !book.hovered) {
                                    book.hovered = true;
                                    item.Mouseover(mesh as THREE.Mesh);
                                    const iFrameSrc = ((book as Book).book as IBook).formats['text/html'];

                                    target = { 
                                        mesh: mesh as THREE.Mesh, 
                                        mapSite: book as MapSite,
                                        data: (book as Book).book,
                                        message: `${(book as Book).book.title} (${(book as Book).book.topic})`,
                                        content: this.sanitizer.bypassSecurityTrustHtml(`<iframe src="${iFrameSrc}" 
                                            width="90%" height="90%" style="background:white"></iframe>`)
                                    } as Target;

                                    targetPromises.push(
                                        this.pixabay.get(target.data.title).then((res: string) => {
                                            target!.background = `url(${res})`;
                                            var material = ((target!.mapSite!.scene as THREE.Mesh)!.material as THREE.MeshStandardMaterial);
                                            material.map = new THREE.TextureLoader().load(res);
                                            material.color = new THREE.Color(0xffffff);
                                            material.needsUpdate = true;
                                        })
                                    )
                                } else if (book.hovered) {
                                    book.hovered = false;
                                    item.Mouseleave();
                                }
                            }
                        }
                    }
                }


                Promise.all(targetPromises).then(() => {
                    if (target) {
                        this.target = target
                        this.targetSubject.next(this.target);
                    } else {
                        this.target = null;
                        this.targetSubject.next(null);
                    }
                });

            
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

        /*

         _______   ______   .______     ____    __    ____  ___      .______       _______  
        |   ____| /  __  \  |   _  \    \   \  /  \  /   / /   \     |   _  \     |       \ 
        |  |__   |  |  |  | |  |_)  |    \   \/    \/   / /  ^  \    |  |_)  |    |  .--.  |
        |   __|  |  |  |  | |      /      \            / /  /_\  \   |      /     |  |  |  |
        |  |     |  `--'  | |  |\  \----.  \    /\    / /  _____  \  |  |\  \----.|  '--'  |
        |__|      \______/  | _| `._____|   \__/  \__/ /__/     \__\ | _| `._____||_______/ 
                                                                                            

        */
        let forwardVector = new THREE.Vector3();
        this.camera.getWorldDirection(forwardVector);

        this.model.scene.position.add(this.velocity);


        /*

         _____  _____  _______   
        |_   _||_   _||_   __ \  
          | |    | |    | |__) | 
          | '    ' |    |  ___/  
           \ \__/ /    _| |_     
            `.__.'    |_____|

        */
        // if (this.states[Actions.Jump]) {
        //     if (this.velocity.y > -9.81) {
        //         this.velocity.y -= 0.01;
        //         debugger
        //     }
        // }
        if (this.actions[Actions.Jump].start && !this.states[Actions.Jump]) {
            this.velocity.y += this.JUMP_SPIRIT;
            this.states[Actions.Jump] = true;
        }
        

        forwardVector.normalize();

        



        for (let action in this.keys) {
            if (this.keys[action]) {
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
                    case 'space':
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
        const objectsTouched: Touch[] = [];
        const userBox = new THREE.Box3().setFromObject(this.model.scene);
        let sidewaysVector = new THREE.Vector3();
        sidewaysVector.crossVectors(this.camera.up, forwardVector).normalize();
        
        const EngageMeshes = (mapSite: MapSite, item: (THREE.Group | THREE.Mesh)): Touch[] => {
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


                    /*

                    ▗▄▄▄▖▗▄▖ ▗▖ ▗▖ ▗▄▄▖▗▖ ▗▖
                      █ ▐▌ ▐▌▐▌ ▐▌▐▌   ▐▌ ▐▌
                      █ ▐▌ ▐▌▐▌ ▐▌▐▌   ▐▛▀▜▌
                      █ ▝▚▄▞▘▝▚▄▞▘▝▚▄▄▖▐▌ ▐▌
                        
                    */
                    const objectTouched: Touch|null = this.Touch(mapSite, userBox, item, meshBox, forwardVector);
                    if (objectTouched) {
                        objectsTouched.push(objectTouched);
                        console.log('objectTouched', objectTouched);
                    }
                }
            }

            return objectsTouched;
        };

        const ExistInSpace = (landed: boolean) => {
            if (landed) {
                fallVector.y = 0;
            }
        };

        for (let mapSite of environment) {
            let objectsTouched: Touch[] = EngageMeshes(mapSite, mapSite.scene);     
        }

        ExistInSpace(includes(objectsTouched, (objectTouched: Touch) => {
            return objectTouched.name == Touches.Land;
        }));
        
        this.model.scene.position.add(fallVector);
        this.activity.next(this);
    }

    Fall(): THREE.Vector3 {
        if (this.states[Actions.Jump]) {
            this.velocity.y -= 0.1;
        }
        return this.localYAxis.clone().multiplyScalar(this.velocity.y);
    }

    Touch(
        mapSite: MapSite,
        userBox: THREE.Box3,
        mesh: THREE.Mesh,
        meshBox: THREE.Box3,
        forwardVector: THREE.Vector3
    ): Touch|null {
        if (/no\-collision/.test(mesh.name)) return null;

        mapSite.Mouseover(mesh, true);

        const userBottomY = userBox.min.y;
        const objectTopY = meshBox.max.y;
        const threshold = 10;
        const overheadDiff = Math.abs(userBottomY - objectTopY);

        // Handle landing on top
        if (overheadDiff < threshold && this.velocity.y < 0) {
            this.states[Actions.Jump] = false;
            this.velocity.y = 0;
            this.model.scene.position.y = objectTopY + (mesh.geometry.boundingBox!.max.y - mesh.geometry.boundingBox!.min.y);
            return new Touch(Touches.Land);
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

        return new Touch(Touches.Side);
    }



}
