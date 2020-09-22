// setup EventTarget and CustomEvent polyfills
import {EventTarget} from "event-target-shim";
global.EventTarget = EventTarget;

import * as THREE from "three";

import DirectionalProjectile from "./engine/physics/object/DirectionalProjectile";
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";
import AuthoritativeStateManager from "./engine/state/authoritative-state-manager/AuthoritativeStateManager";
import {DiContainer} from "di-container-js";
import FlyingObject from "./engine/physics/object/FlyingObject";

test('should return find intersection if inside of object', async () => {
    const direction = new THREE.Vector3(1, 0, 0);
    const projectile1 = createProjectile(new THREE.Vector3(0, 0, 0), direction);

    const projectileSequenceController = createProjectileSequenceController();
    projectileSequenceController.projectiles = [projectile1];

    const gameObject = createDummyBox();

    const result = projectileSequenceController.findHitsWithObject(gameObject);
    expect(result.length).toBe(1);
});

test('should not check intersections with all projectiles if first one is behind an object', async () => {
    const direction = new THREE.Vector3(1, 0, 0);
    const projectile1 = createProjectile(new THREE.Vector3(12, 0, 0), direction);
    const projectile2 = createProjectile(new THREE.Vector3(13, 0, 0), direction);
    const projectile3 = createProjectile(new THREE.Vector3(14, 0, 0), direction);

    const projectileSequenceController = createProjectileSequenceController();
    projectileSequenceController.projectiles = [projectile1, projectile2, projectile3];

    const gameObject = createDummyBox();

    projectileSequenceController.isProjectileIntersectsWithObject = jest.fn(projectileSequenceController.isProjectileIntersectsWithObject);
    const result = projectileSequenceController.findHitsWithObject(gameObject);

    expect(result).toBe(null);
    expect(projectileSequenceController.isProjectileIntersectsWithObject.mock.calls.length).toBe(1);
});

function createProjectile(position, direction) {
    const geometry = new THREE.SphereGeometry(1, 1, 1);
    const model = new THREE.Mesh(geometry);
    const directionalProjectile = new DirectionalProjectile(null, model);
    directionalProjectile.changeDirection(direction);
    directionalProjectile.position.copy(position);

    return directionalProjectile;
}

function createProjectileSequenceController() {
    const diContainer = new DiContainer();
    const stateManager = new AuthoritativeStateManager(diContainer, null);
    return new ProjectileSequenceController(null, stateManager, diContainer);
}

function createDummyBox() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);

    const material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;
    let model = new THREE.Mesh(geometry, material);

    const gameObject = new FlyingObject(null, model);
    gameObject.position = new THREE.Vector3(0, 0, 0);

    return gameObject;
}
