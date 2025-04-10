import * as THREE from 'three';
import { Injectable, inject, Inject } from '@angular/core';
import { User } from '../models/user';
import { Maze } from './levels/maze';
import { MapSite } from '../models/map-site';
import { fromEvent } from 'rxjs';
import { LibraryService, Library } from './services/library';

@Injectable({
    providedIn: 'root'
})
export class Game {
    public maze!: Maze;
    scene!: THREE.Scene;
    public renderer!: THREE.WebGLRenderer;
    levels: any[] = [];
    user!: User;
    animationFrameId: number = -1;
    library!: Library;

    constructor(@Inject(LibraryService) private libraryService: LibraryService) {
        libraryService.library$.subscribe((lib: Library) => this.library = lib);
    }

    init(user: User, maze: Maze) {
        this.user = user;
        this.maze = maze;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.domElement.id = "view";


        document.body.appendChild(this.renderer.domElement);

        this.scene.add(this.user.model.scene);
        console.log("🧍 User model loaded", this.user);

        fromEvent(window, 'resize').subscribe(() => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.user.camera.aspect = w / h;
            this.user.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });

        for (let key in this.maze.shell) {
            this.scene.add(this.maze.shell[key]);
        }

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        ambientLight.position.set(this.maze.roomWidth * this.maze.dimensions * 2, 100, this.maze.roomWidth * this.maze.dimensions * 2);
        this.scene.add(ambientLight);

        this.animate();
    }

    animate() {
        let activeMapSites: MapSite[] = [];
        for (let level of this.levels) {
            activeMapSites = activeMapSites.concat(level.Activate());
        }
        this.user.setEnvironment(activeMapSites);
        this.user.Act();
        this.renderer.render(this.scene, this.user.camera);
        this.animationFrameId = window.requestAnimationFrame(this.animate.bind(this));
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Dispose scene objects
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (object.material instanceof THREE.Material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat) => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });

        // Dispose of renderer
        this.renderer.dispose();
        this.renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext();
        
        // Remove canvas from DOM
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }

        console.log("🧹 Cleanup completed!");
    }

}