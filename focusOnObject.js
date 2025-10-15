import * as THREE from 'three';

export function focusOnObject(object, camera, controls) {
    const vector = new THREE.Vector3();
    object.getWorldPosition(vector);
    controls.target.copy(vector);
    camera.position.set(vector.x + 5, vector.y + 5, vector.z + 5);
    camera.lookAt(vector);
    controls.update();
}