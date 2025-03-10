import * as THREE from 'three';

export function KeyOf<T>(obj: T, value: any): keyof T | string {
    for (var key in obj) {
        if (obj[key] == value) {
            return key as keyof T;
        }
    }
    return '';
}

export function getAllDescendants(obj: THREE.Object3D, descendants: THREE.Object3D[] = []) {
    obj.children.forEach((child) => {
        descendants.push(child);
        getAllDescendants(child, descendants);
    });
    return descendants;
}