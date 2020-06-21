/**
 * @typedef {import('./engine/net/service/MultiplayerService').default} MultiplayerService
 */

// initialize required modules
import './engine/frontend';
import './engine/net';

import Engine from './engine';
import {controls} from "./engine/object-control";
import {cameraManagers} from "./engine/frontend/camera";
import FlyingObject from "./engine/physics/object/FlyingObject";
import Emitter from './engine/util/Emitter';
//import EventTarget from 'events';

const filepaths = {
    "models": {
        "smallSpaceFighter": "SmallSpaceFighter.glb"
    },
    "sprites": {
        "aim": "aim-red.png"
    }
};

export class Game extends Emitter {

    constructor() {
        super();
        this.diContainer = Engine.getDiContainer();
    }

    async start() {
        this._configure();

        /** @type {MultiplayerService} */
        //const multiplayerService = await this.diContainer.get('multiplayerService');
        //await multiplayerService.connect();
        //await multiplayerService.requestSpawn();

        this.frontendFacade = await Engine.createFrontendFacade(filepaths);
        await this._addAimSprite();

        const controller = await this.frontendFacade.createObject("player1", FlyingObject, "smallSpaceFighter", controls.FLYING_OBJECT_CONTROLLER);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER, controller);
        this.frontendFacade.startGameLoop();

        // await this.addSpaceships();
        // const gameObject = await this.frontendFacade.createObject("player1", FlyingObject, "smallSpaceFighter");
        // TODO rename switchControls to associate controls?
        // await this.frontendFacade.attachControls(controls.FLYING_OBJECT_REMOTE_CONTROLS_TEST, gameObject);
        // await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER);
        // this.frontendFacade.startGameLoop();
    }

    _configure() {
        Engine.setEnv("browser");
        this.diContainer.configure('webRtcNetworkClient', {serverIp: '127.0.0.1', signalingServerPort: '8080'});
        this.diContainer.configure('messageSerializerDeserializer', {protoBundle: require('../../common/proto/bundle.json')});
    }

    async _addAimSprite() {
        const sprite = await this.frontendFacade.createSprite('aim');
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(64, 64, 1);
        // sprite.scale.set(sprite.material.map.image.width, sprite.material.map.image.height, 1);
    }

}
