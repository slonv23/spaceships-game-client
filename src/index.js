/**
 * @typedef {import('./engine/net/service/MultiplayerService').default} MultiplayerService
 * @typedef {import('./engine/state/MultiplayerStateManager').default} MultiplayerStateManager
 * @typedef {import('di-container-js').default} DiContainer
 */

// register required modules
import './engine/frontend';
import './engine/net';
// register default logger
import './engine/logging';

import Engine from './engine';
import {controllers} from "./engine/object-control";
import {cameraManagers} from "./engine/frontend/camera";
import FlyingObject from "./engine/physics/object/FlyingObject";
import Emitter from './engine/util/Emitter';

const filepaths = {
    "models": {
        "smallSpaceFighter": "SmallSpaceFighter.glb"
    },
    "sprites": {
        "aim": "aim-red.png"
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

        this.stateManager.registerGameObjectType(gameObjectTypes.SPACESHIP,
                                                 FlyingObject,
                                                 controllers.REMOTE_FLYING_OBJECT_CONTROLLER,
                                                 "smallSpaceFighter");
        this.stateManager.defaultGameObjectType = gameObjectTypes.SPACESHIP;

        await this.startInMultiplayerMode();
    }

    async startInMultiplayerMode() {
        const pingDisplay = document.getElementById('ping');
        this.multiplayerService.addEventListener('ping', (event) => {
            pingDisplay.innerText = event.detail;
        });

        await this.multiplayerService.connect();
        const assignedObjectId = await this.multiplayerService.requestSpawn();
        const playerGameObjectController = await this.stateManager.createController(assignedObjectId,
                                                                                    controllers.FLYING_OBJECT_MP_CONTROLLER);
        this.stateManager.specifyPlayerControllerAndControlledObject(assignedObjectId, playerGameObjectController);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER, playerGameObjectController);

        this.frontendFacade.startGameLoop();
        this.multiplayerService.startStateSync();
    }

    async startInSinglePlayerMode() {
        const assignedObjectId = 1;
        const playerGameObjectController = await this.stateManager.createObject(assignedObjectId,
                                                                                gameObjectTypes.SPACESHIP,
                                                                                controllers.FLYING_OBJECT_SP_CONTROLLER);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER, playerGameObjectController);
        this.frontendFacade.startGameLoop();
    }

    _configureEngine() {
        Engine.setEnv("browser");
        this.diContainer.configure('assetManager', {filepaths});
        this.diContainer.configure('webRtcNetworkClient', {serverIp: '127.0.0.1', signalingServerPort: '8080'});
        this.diContainer.configure('messageSerializerDeserializer', {protoBundle: require('../../common/proto/bundle.json')});
        // TODO create model or separate component (e.g. MultiplayerConfiguration)
        //  which could be shared btw components
        this.diContainer.configure('multiplayerStateManager', {
            packetPeriodFrames: globalConfig.packetPeriodFrames,
            inputGatheringPeriodFrames: globalConfig.inputGatheringPeriodFrames,
            fps: globalConfig.fps,
        });
        this.diContainer.configure('frontendFacade', {fps: globalConfig.fps});
        this.diContainer.configure('multiplayerService', {fps: globalConfig.fps});
    }

    async _loadDependencies() {
        this.frontendFacade = await this.diContainer.get("frontendFacade");
        this.stateManager = await this.diContainer.get('multiplayerStateManager');
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

}
