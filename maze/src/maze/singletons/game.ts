import * as THREE from 'three';
import { Injectable, inject } from '@angular/core';
import { User } from '../models/user';
import { MapSite } from '../models/map-site';
import { fromEvent } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class Game {
	scene!: THREE.Scene;
  	renderer!: THREE.WebGLRenderer;
  	levels: any[] = [];
  	user!: User;

	init(user: User) {
		this.user = user;
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
	    window.requestAnimationFrame(this.animate.bind(this));
	 }
}