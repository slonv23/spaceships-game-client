// setup EventTarget and CustomEvent polyfills
import {EventTarget} from "event-target-shim";
global.EventTarget = EventTarget;

import * as THREE from "three";

import DirectionalProjectile from "./engine/physics/object/DirectionalProjectile";
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";
import AuthoritativeStateManager from "./engine/state/authoritative-state-manager/AuthoritativeStateManager";
import {DiContainer} from "di-container-js";

test('should build dependency graph', async () => {
    const geometry = new THREE.BoxGeometry(10, 10, 10);

    const material = new THREE.MeshBasicMaterial();//this.createProjectileMaterial();
    let model = new THREE.Mesh(geometry, material);

    const direction = new THREE.Vector3(1, 0, 0);
    const projectile1 = createProjectile(new THREE.Vector3(12, 0, 0), direction);
    const projectile2 = createProjectile(new THREE.Vector3(13, 0, 0), direction);
    const projectile3 = createProjectile(new THREE.Vector3(14, 0, 0), direction);

    const diContainer = new DiContainer();
    const stateManager = new AuthoritativeStateManager(diContainer, null);
    const projectileSequenceController = new ProjectileSequenceController(null, stateManager, diContainer);
    projectileSequenceController.projectiles = [projectile1, projectile2, projectile3];

    // const gameObject = ...;
    // const result = projectileSequenceController.findHitsWithObject(gameObject);
    // ...

});

function createProjectile(position, direction) {
    const geometry = new THREE.SphereGeometry(1, 1, 1);
    const model = new THREE.Mesh(geometry);
    const directionalProjectile = new DirectionalProjectile(null, model);
    directionalProjectile.changeDirection(direction);
    directionalProjectile.position.copy(position);

    return directionalProjectile;
}