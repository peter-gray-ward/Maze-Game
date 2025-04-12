import * as THREE from 'three';

export const randomColor = (): string => `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

export const ceilingTexture = new THREE.TextureLoader().load("/floor.jpg", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
});

export const floorTexture = new THREE.TextureLoader().load("/floor.jpg", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
});

export const wallpaperTexture = new THREE.TextureLoader().load("/wallpaper.webp", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
});

export const wallpaperTextureShell = new THREE.TextureLoader().load("/wallpaper.webp", texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5000, 5000);
});

export const randomInRange = (from: number, to: number): number => {
    return to + Math.random() * (to - from);
}

export function buildShell(pieces: THREE.Mesh[], texture: THREE.Texture): THREE.Mesh {
	let shellVertices: number[] = [];
    let shellIndices: number[] = [];
    let shellColors: number[] = [];
    let shellBufferGeometry = new THREE.BufferGeometry();

    let vertexOffset = 0;
    pieces.forEach(piece => {
    	const mesh = piece as THREE.Mesh;
        const geometry = mesh.geometry;
        const positions = Array.from(geometry.attributes['position'].array);
        const indices = geometry.index ? Array.from(geometry.index.array) : [];

        mesh.updateMatrixWorld(true);
        const matrix = mesh.matrixWorld;

        for (let i = 0; i < positions.length; i += 3) {
          const vertex = new THREE.Vector3(positions[i], positions[i + 1] - 0.1, positions[i + 2]);
          vertex.applyMatrix4(matrix);
          shellVertices.push(vertex.x, vertex.y, vertex.z);
          shellColors.push(1, 1, 1, 1);
        }

        indices.forEach(index => {
            shellIndices.push(index + vertexOffset);
        });

        vertexOffset += positions.length / 3; // Since each vertex has 3 components (x, y, z)
    });

    shellBufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shellVertices, 3));
    shellBufferGeometry.setIndex(shellIndices);
    shellBufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(shellColors, 4));
    shellBufferGeometry.computeVertexNormals();

    var shell = new THREE.Mesh(
        shellBufferGeometry,
        new THREE.MeshStandardMaterial({
        	map: texture,
        	vertexColors: true,
        	transparent: true,
            side: THREE.DoubleSide
        })
    );

    return shell;
}