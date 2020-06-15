// initialize required modules
import './engine/frontend';
import './engine/net';

import Engine from './engine';
import {controls} from "./engine/object-control";
import {cameraManagers} from "./engine/frontend/camera";
import FlyingObject from "./engine/physics/object/FlyingObject";

const filepaths = {
    "models": {
        "smallSpaceFighter": "SmallSpaceFighter.glb"
    },
    "sprites": {
        "aim": "aim-red.png"
    }
};

export class Game {

    async start() {
        Engine.setEnv("browser");
        const diContainer = Engine.getDiContainer();

        //diContainer.configure('webRtcNetworkClient', {serverIp: '127.0.0.1', signalingServerPort: '8080'});
        // eslint-disable-next-line no-undef
        diContainer.configure('messageSerializerDeserializer', {protoBundle: require('../../common/proto/bundle.json')});
        const messageSerializerDeserializer = await diContainer.get('messageSerializerDeserializer');
        /*const webRtcNetworkClient = await diContainer.get('webRtcNetworkClient');
        await webRtcNetworkClient.connect();*/

        this.frontendFacade = await Engine.createFrontendFacade(filepaths);

        const sprite = await this.frontendFacade.createSprite('aim');
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(64, 64, 1);
        // sprite.scale.set(sprite.material.map.image.width, sprite.material.map.image.height, 1);

        await this.addSpaceships();

        const gameObject = await this.frontendFacade.createObject("player1", FlyingObject, "smallSpaceFighter");
        // TODO rename switchControls to associate controls?
        await this.frontendFacade.attachControls(controls.FLYING_OBJECT_REMOTE_CONTROLS_TEST, gameObject);
        await this.frontendFacade.attachCameraManager(cameraManagers.FLYING_OBJECT_CAMERA_MANAGER);
        this.frontendFacade.startGameLoop();
    }

    async addSpaceships() {
        const spaceShip1 = await this.frontendFacade.createObject("bot1", FlyingObject, "smallSpaceFighter");
        spaceShip1.position.z = -4;
        spaceShip1.position.x = 5;
        spaceShip1.position.y = 5;
        spaceShip1.velocity.z = 0;

        const spaceShip2 = await this.frontendFacade.createObject("bot2", FlyingObject, "smallSpaceFighter");
        spaceShip2.position.z = -10;
        spaceShip2.position.x = -3.5;
        spaceShip2.position.y = 4.5;
        spaceShip2.velocity.z = 0;

        const spaceShip3 = await this.frontendFacade.createObject("bot3", FlyingObject, "smallSpaceFighter");
        spaceShip3.position.z = -100;
        spaceShip3.position.x = -3.5;
        spaceShip3.position.y = 4.5;
        spaceShip3.velocity.z = 0;
    }

}
