/**
 * @typedef {import('./engine/asset-management/AssetManager').default} AssetManager
 */
import * as THREE from 'three';

import SpaceFighter from "./engine/physics/object/SpaceFighter";
import DirectionalProjectile from "./engine/physics/object/DirectionalProjectile";
import GunRoundFragShader from "./engine/frontend/shader/gun-round.frag";
import GunRoundVertShader from "./engine/frontend/shader/gun-round.vert"

/**
 * @param {number} objectId
 * @param {AssetManager} assetManager
 * @returns {SpaceFighter}
 */
export function spaceFighterFactory(objectId, assetManager) {
    const asset = assetManager.get3dAsset('spaceFighter');

    const model = asset.scene.children[0].clone(); //asset.scene.children[0].children[0].clone();
    model.matrixAutoUpdate = false;

    return new SpaceFighter(objectId, model);
}

export function gunProjectileFactory(objectId) {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    geometry.applyMatrix(new THREE.Matrix4().makeScale( 2.0, 2.0, 8.0)); // 1 1 4

    const material = new THREE.ShaderMaterial({
        vertexShader:   GunRoundVertShader,
        fragmentShader: GunRoundFragShader,
        transparent: true,
    });

    const model = new THREE.Mesh(geometry, material);

    return new DirectionalProjectile(objectId, model);
}
