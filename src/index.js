// initialize required modules
import './engine/frontend';
import './engine/net';

import {createFrontendFacade, diContainer} from './engine';
import {controls} from "./engine/frontend/control";
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
        /*diContainer.configure('webRtcNetworkClient', {serverIp: '127.0.0.1', signalingServerPort: '8080'});
        // eslint-disable-next-line no-undef
        diContainer.configure('messageEncoderDecoder', {protoBundle: require('../../common/proto/bundle.json')});

        const webRtcNetworkClient = await diContainer.get('webRtcNetworkClient');
        await webRtcNetworkClient.connect();*/

        this.frontendFacade = await createFrontendFacade(filepaths);

        const sprite = await this.frontendFacade.createSprite('aim');
        sprite.center.set(0.5, 0.5);
        sprite.scale.set(64, 64, 1);
        // sprite.scale.set(sprite.material.map.image.width, sprite.material.map.image.height, 1);

        await this.addSpaceships();

        const gameObject = await this.frontendFacade.createObject("player1", FlyingObject, "smallSpaceFighter");
        // TODO rename switchControls to associate controls?
        this.frontendFacade.switchControls(controls.FLYING_OBJECT_CONTROLS, gameObject);
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
