/**
 * @typedef {import('./engine/net/service/MultiplayerService').default} MultiplayerService
 * @typedef {import('./engine/state/multiplayer-state-manager/MultiplayerStateManager').default} MultiplayerStateManager
 * @typedef {import('di-container-js').default} DiContainer
 */

// register required modules
import './engine/frontend';
import './engine/net';
import './engine/logging';
import './engine/state/multiplayer-state-manager';

import Engine from './engine';
import {cameraManagers} from "./engine/frontend/camera";
import Emitter from './engine/util/Emitter';
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";
import SpaceFighterMultiplayerController from "./engine/object-control/space-fighter/SpaceFighterMultiplayerController";
import RemoteSpaceFighterController from "./engine/object-control/space-fighter/RemoteSpaceFighterController";
import HudController from "./engine/object-control/HudController";

const filepaths = {
    assets3d: {
        spaceFighter: "StarSparrow2.glb"
    },
    sprites: {
        aim: "aim-red.png"
    }
};

const gameObjectTypes = {
    SPACESHIP: 1,
};

const globalConfig = require('../../config.json');

export class Game extends Emitter {

    /** @type {MultiplayerStateManager} */
    stateManager;
    /** @type {MultiplayerService} */
    multiplayerService;
    /** @type {DiContainer} */
    diContainer;

    constructor() {
        super();
        this.diContainer = Engine.getDiContainer();
    }

    async start() {
        this._configureEngine();
        await this._loadDependencies();
        await this._prepareGameEnvironment();
        await this._setCubeMap();

        const hubController = await this.diContainer.constructExternal(HudController);
        this.stateManager.addController(hubController);

        this.projectileSequenceControllerFactory = await this.diContainer.createFactory(ProjectileSequenceController);
        this.diContainer.provide('projectileSequenceControllerFactory', this.projectileSequenceControllerFactory);
        this.spaceFighterMultiplayerControllerFactory = await this.diContainer.createFactory(SpaceFighterMultiplayerController);
        this.remoteSpaceFighterControllerFactory = await this.diContainer.createFactory(RemoteSpaceFighterController);

        this.stateManager.associateControllerFactoryWithGameObjectType(gameObjectTypes.SPACESHIP,
                                                                       this.remoteSpaceFighterControllerFactory);
        await this.startInMultiplayerMode();
    }

    async startInMultiplayerMode() {
        const pingDisplay = document.getElementById('ping');
        this.multiplayerService.addEventListener('ping', (event) => {
            pingDisplay.innerText = event.detail;
        });

        await this.multiplayerService.connect();
        const assignedObjectId = await this.multiplayerService.requestSpawn();

        const playerGameObjectController = await this.stateManager.createObjectController(assignedObjectId,
                                                                                          this.spaceFighterMultiplayerControllerFactory);
        this.stateManager.specifyPlayerControllerAndControlledObject(assignedObjectId, playerGameObjectController);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER, playerGameObjectController);

        this.frontendFacade.startGameLoop();
        this.multiplayerService.startStateSync();
    }

    /*async startInSinglePlayerMode() {
        const assignedObjectId = 1;
        const playerGameObjectController = await this.stateManager.createObject(assignedObjectId,
                                                                                gameObjectTypes.SPACESHIP,
                                                                                controllers.SPACE_FIGHTER_SP_CONTROLLER);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER, playerGameObjectController);
        this.frontendFacade.startGameLoop();
    }*/

    _configureEngine() {
        Engine.setEnv("browser");
        this.diContainer.configure('assetManager', {filepaths});
        this.diContainer.configure('webRtcNetworkClient', {serverIp: '127.0.0.1', signalingServerPort: '8080'});
        this.diContainer.configure('messageSerializerDeserializer', {protoBundle: require('../../common/proto/bundle.json')});
        // TODO create model or separate component (e.g. MultiplayerConfiguration)
        //  which could be shared btw components
        this.diContainer.configure('stateManager', {
            packetPeriodFrames: globalConfig.packetPeriodFrames,
            inputGatheringPeriodFrames: globalConfig.inputGatheringPeriodFrames,
            fps: globalConfig.fps,
        });
        this.diContainer.configure('frontendFacade', {fps: globalConfig.fps});
        this.diContainer.configure('multiplayerService', {fps: globalConfig.fps});
    }

    async _loadDependencies() {
        this.frontendFacade = await this.diContainer.get("frontendFacade");
        this.stateManager = await this.diContainer.get('stateManager');
        this.multiplayerService = await this.diContainer.get('multiplayerService');
    }

    async _prepareGameEnvironment() {
        await this._addAimSprite();
    }

    async _addAimSprite() {
        const sprite = await this.frontendFacade.createSprite('aim');
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(64, 64, 1);
        // sprite.scale.set(sprite.material.map.image.width, sprite.material.map.image.height, 1);
    }

    async _setCubeMap() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'assets/cubemap/px.jpg',
            'assets/cubemap/nx.jpg',
            'assets/cubemap/py.jpg',
            'assets/cubemap/ny.jpg',
            'assets/cubemap/pz.jpg',
            'assets/cubemap/nz.jpg',
        ]);
        this.frontendFacade.renderer.scene.background = texture;
    }

}

// WORKAROUND FOR SHADER IMPORTS

import GunRoundVertShader from "./engine/frontend/shader/gun-round.vert";
import GunRoundFragShader from "./engine/frontend/shader/gun-round.frag";
import * as THREE from "three";

ProjectileSequenceController.prototype.createProjectileMaterial = function() {
    return new THREE.ShaderMaterial({
        vertexShader:   GunRoundVertShader,
        fragmentShader: GunRoundFragShader,
        transparent: true,
    });
}
