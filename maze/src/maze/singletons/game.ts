import * as THREE from 'three';
import { Injectable, inject } from '@angular/core';
import { User } from '../models/user';


@Injectable({
	providedIn: 'root'
})
export class Game {
	scene!: THREE.Scene;
  	renderer!: THREE.WebGLRenderer;
  	actors: any[] = [];
  	user!: User;

	init(user: User) {
		this.user = user;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.domElement.id = "view";

		document.body.appendChild(this.renderer.domElement);

		this.scene.add(this.user.model.scene);
      	console.log("🧍 User model loaded", this.user);
      	
		this.animate();
	}

	animate() {
		this.user.Act();
		for (let actor of this.actors) {
			actor.Act();
		}
	    this.renderer.render(this.scene, this.user.camera);
	    window.requestAnimationFrame(this.animate.bind(this));
	 }
}