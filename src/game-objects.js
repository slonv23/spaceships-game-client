/**
 * @typedef {import('./engine/frontend/asset-management/AssetManager').default} AssetManager
 */

import FlyingObject from "./engine/physics/object/FlyingObject";

/**
 * @param {number} objectId
 * @param {AssetManager} assetManager
 */
export function spaceFighterFactory(objectId, assetManager) {
    const asset = assetManager.get3dAsset('smallSpaceFighter');

    const model = asset.scene.children[0].children[0].clone();
    model.matrixAutoUpdate = false;

    return new FlyingObject(objectId, model);
}
