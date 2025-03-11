import * as THREE from 'three';

export function KeyOf<T>(obj: T, value: any): keyof T | string {
    for (var key in obj) {
        if (obj[key] == value) {
            return key as keyof T;
        }
    }
    return '';
}

export function getAllDescendants(obj: THREE.Object3D, descendants: THREE.Mesh[] = [], name?: RegExp): THREE.Mesh[] {
    obj.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
            if (name && name.test(child.name)) {
                descendants.push(child);
            } else if (!name) {
                descendants.push(child);
            }
        }
        getAllDescendants(child, descendants, name);
    });
    return descendants;
}