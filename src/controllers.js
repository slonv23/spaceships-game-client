import {diContainer} from "./engine/globals";

import SpaceFighterMultiplayerController from "./engine/object-control/space-fighter/SpaceFighterMultiplayerController";
import RemoteSpaceFighterController from "./engine/object-control/space-fighter/RemoteSpaceFighterController";
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";

import {gunProjectileFactory, spaceFighterFactory} from "./game-objects";

export const controllers = Object.freeze({
    SPACE_FIGHTER_MP_CONTROLLER: Symbol(),
    REMOTE_SPACE_FIGHTER_CONTROLLER: Symbol(),
    SPACE_FIGHTER_GUN_PROJECTILES: Symbol(),
});

diContainer.registerClass(controllers.SPACE_FIGHTER_MP_CONTROLLER, SpaceFighterMultiplayerController, {
    gameObjectFactory: spaceFighterFactory,
    projectileSequenceControllerRef: controllers.SPACE_FIGHTER_GUN_PROJECTILES,
});
diContainer.registerClass(controllers.REMOTE_SPACE_FIGHTER_CONTROLLER, RemoteSpaceFighterController, {
    gameObjectFactory: spaceFighterFactory,
});
diContainer.registerClass(controllers.SPACE_FIGHTER_GUN_PROJECTILES, ProjectileSequenceController, {
    gameObjectFactory: gunProjectileFactory,
});
